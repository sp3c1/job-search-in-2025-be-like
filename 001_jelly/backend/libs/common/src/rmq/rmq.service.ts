import {
  Channel,
  connect,
  Connection,
  ConsumeMessage,
} from 'amqplib';

import { DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  RMQ_RECEIVER_HANDLER,
  RMQ_SENDER_HANDLER,
  RmqPublishOpts,
  RmqSubscribeOpts,
} from './reciever-handler.dercorator';
import { AckRmq } from './types';
import { IRmqConfig } from './types/config';

@Injectable()
export class RmqService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel; // publishing
  private channels: { [key: string]: Channel } = {}; // consuming
  private receiverHandlers: Record<
    string,
    (msg: any, channel: AckRmq, rawMsg: ConsumeMessage) => Promise<void> | void
  > = {};
  private publisherConfigs: Record<
    string,
    {
      exchange?: string;
      routingKey: string;
      handler: (...args: any[]) => any;
    }
  > = {};
  private config: IRmqConfig;

  constructor(private readonly discover: DiscoveryService, private configService: ConfigService) {
    this.config = this.configService.getOrThrow<IRmqConfig>('app.RMQ');
  }

  async onModuleInit() {
    await this.connect();
    await this.bindReceiverHandlers();
    await this.bindSenderHandlers();
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  private async connect() {
    try {
      Logger.log('RMQ: Connecting...');

      // Determine protocol, default to 'amqp'
      const protocol = this.config.PROTOCOL || 'amqps';

      // Encode credentials for URL
      const credentials =
        encodeURIComponent(this.config.USERNAME) + ':' + encodeURIComponent(this.config.PASSWORD);

      // Build the connection URL
      const connectionString = `${protocol}://${credentials}@${this.config.HOST}:${this.config.PORT}`;

      // Prepare connection options for TLS if needed
      let connectOptions: any = {};

      // Establish connection with extended options
      this.connection = await connect(connectionString, connectOptions);
      this.channel = await this.connection.createChannel();
      Logger.log('RMQ: Connection established');
    } catch (error) {
      Logger.error('RMQ: Connection error', error);
      throw error;
    }
  }

  private async bindReceiverHandlers() {
    const receiversMeta = await this.discover.providerMethodsWithMetaAtKey<RmqSubscribeOpts>(
      RMQ_RECEIVER_HANDLER
    );

    for (const { meta, discoveredMethod } of receiversMeta) {
      const queue = meta.queue;
      Logger.log(
        `RMQ: Binding handler ${discoveredMethod.parentClass.name}.${discoveredMethod.methodName} to queue ${queue}`
      );

      this.channels[queue] = await this.connection.createChannel();
      const ref = this.channels[queue];
      // Bind method to instance and store in handlers map
      this.receiverHandlers[queue] = discoveredMethod.handler.bind(
        discoveredMethod.parentClass.instance
      );

      // Ensure queue exists (create if not exists)
      await ref.assertQueue(queue, { durable: true });

      // prefetch more?
      ref.prefetch(Math.max(meta?.prefetch || 0, 3));

      // Start consuming messages
      await ref.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) {
            return;
          }
          try {
            const content = msg.content.toString();
            const parsed = JSON.parse(content);
            const handler = this.receiverHandlers[queue];
            if (handler) {
              await Promise.resolve(
                handler(
                  parsed,
                  { ack: () => ref.ack(msg), nack: () => ref.nack(msg) },
                  msg
                )
              );
              // Manual ack after successful handling
              // ref.ack(msg);
            } else {
              Logger.warn(`No handler for queue ${queue}`);
              ref.nack(msg, false, false); // Reject message
            }
          } catch (error) {
            Logger.error('Error processing message', error);
            ref.nack(msg, false, false); // Reject message without requeue
          }
        },
        { noAck: false, }
      ); // Ensure manual acknowledgments
    }
  }

  private async bindSenderHandlers() {
    const sendersMeta = await this.discover.providerMethodsWithMetaAtKey<RmqPublishOpts>(
      RMQ_SENDER_HANDLER
    );

    for (const { meta, discoveredMethod } of sendersMeta) {
      const { exchange, routingKey } = meta;
      Logger.log(
        `RMQ: Found publisher ${discoveredMethod.parentClass.name}.${discoveredMethod.methodName} ` +
        `for exchange: ${exchange ?? 'default'}, routingKey: ${routingKey}`
      );

      // If an exchange is specified, assert it exists.
      if (exchange) {
        try {
          await this.channel.assertExchange(exchange, 'direct', { durable: true });
          Logger.log(`RMQ: Asserted exchange ${exchange}`);
        } catch (error) {
          Logger.error(`RMQ: Failed to assert exchange ${exchange}`, error);
        }
      } else if (routingKey) {
        await this.channel.assertQueue(routingKey, { durable: true, }).catch();
      }

      // Store the publisher configuration in the map using the routingKey as the key
      this.publisherConfigs[routingKey] = {
        exchange,
        routingKey,
        handler: discoveredMethod.handler.bind(discoveredMethod.parentClass.instance),
      };

      Logger.log(`RMQ: Stored publisher config for routingKey: ${routingKey}`);
    }
  }

  // Publishing method example
  async send(
    {
      exchange = '',
      routingKey,
    }: {
      exchange?: string;
      routingKey: string;
    },
    message: any
  ) {
    try {
      const buffer = Buffer.from(JSON.stringify(message));
      Logger.log(`RMQ: Message sent to ${routingKey}`, message);

      this.channel.sendToQueue(routingKey, buffer, { persistent: true, deliveryMode: 2 });
    } catch (error) {
      Logger.error('RMQ: Failed to send message', error);
    }
  }
}
