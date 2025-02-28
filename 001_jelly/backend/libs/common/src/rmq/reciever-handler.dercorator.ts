import {
  applyDecorators,
  SetMetadata,
} from '@nestjs/common';

export interface RmqSubscribeOpts {
  queue: string;
  prefetch?: number; // will default to 1
}

export const RMQ_RECEIVER_HANDLER = Symbol('RMQ_RECEIVER_HANDLER');

export const RmqSubscribe = (options: RmqSubscribeOpts) =>
  applyDecorators(SetMetadata(RMQ_RECEIVER_HANDLER, options));

export interface RmqPublishOpts {
  exchange?: string;
  routingKey: string;
}

export const RMQ_SENDER_HANDLER = Symbol('RMQ_SENDER_HANDLER');

export const RmqPublish = (options: RmqPublishOpts) =>
  applyDecorators(SetMetadata(RMQ_SENDER_HANDLER, options));
