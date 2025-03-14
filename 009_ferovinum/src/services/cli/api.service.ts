import net from 'net';

import { displaySystemMessage } from '../../bin/cli/cli';
import { GenericService } from '../generic';
import { LoggerService } from '../shared/logger.service';
import {
    Command,
    CommandArgs,
    DELIMITER,
    ProtocolService,
    Sku,
} from '../shared/protocol.service';

export type CliHandle = typeof displaySystemMessage;

export class ApiService implements GenericService {
    private client: net.Socket | null = null;
    private reconnectDelay = 1000; // restart with a 1-second delay
    public controller: AbortController;

    private internalMsgQueue: string[] = [];

    constructor(
        private cliHandle: CliHandle,
        private protocolService: ProtocolService,
        private loggerService: LoggerService
    ) {
        this.controller = new AbortController;
    }

    public async init(): Promise<void> {
        this.cliHandle('Connecting to TCP Server with local credentials', 'cli');
        await this.connectWithRetry();
        if (!this.client) {
            throw new Error('Client init error');
        }

    }

    private async connectWithRetry(): Promise<void> {
        while (true) {
            try {
                await Promise.race([
                    this.connect(),
                    this.timeout(20000)
                ]);
                this.internalQueueOffload();
                break;
            } catch (error) {
                // this.cliHandle('Attempting to reconnect', 'cli');
                await this.delay(this.reconnectDelay);
            }
            await this.delay(2000);
        }
    }

    // Returns a Promise that resolves when the connection is successful.
    private connect(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.client = net.createConnection(
                { port: Number(process.env.SOCKET_PORT) || 3001, host: 'localhost' },
                () => {
                    this.cliHandle('Connection ready', 'cli');

                    this.client!.write(`APIKEY: ${process.env.API_KEY}${DELIMITER}`);
                    resolve();
                },
            );

            this.client.once('error', (err) => {
                reject(err); // This will trigger the Promise's rejection
            });

        });
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private timeout(ms: number) {
        return new Promise((_, reject) => setTimeout(reject, ms));
    }

    public async send<C extends keyof CommandArgs>(cmd: C, ...args: CommandArgs[C]) {
        const message = this.protocolService.validateCommand(cmd, ...args);
        if (!message) {
            return
        }
        if (!this.client) {
            return
        }


        // check connection if ok
        if (this.client.writable) {
            try {
                this.client.write(`${message}${DELIMITER}`);
            } catch (error) {
                this.cliHandle(`error: ${(error as Error).message}`, 'cli')
            }
            return;
        }

        this.internalMsgQueue.push(message);
    }

    public quit() {
        try {
            return this.client?.unref();
        } catch (_) {

        }
    }


    public async internalQueueOffload() {
        while (1) {
            const msg = this.internalMsgQueue.shift();
            if (!msg) {
                break;
            }

            this.client?.write(`${msg}${DELIMITER}`);
        }
    }

    registerHandle() {
        if (!this.client) {
            return;
        }

        this.client.on('data', (buff) => {
            const deserialized = buff.toString();

            const msgs = deserialized.split(DELIMITER) || [];
            let seperate = false;
            for (const msg of msgs) {
                const [cmd, ...args] = <[Command, Sku, string, string]>msg.split(" ");
                const sanitized = this.protocolService.validateCommand(cmd, ...args);

                if (!sanitized) {
                    continue
                }
                seperate = true;

                this.cliHandle(`${sanitized}`, 'system');
            }


        });

        this.client.on('end', async () => {
            this.cliHandle(`Lost connection, retrying, messages in queue mode`, 'cli');
            this.client!.removeAllListeners();

            await this.delay(5000);
            await this.connectWithRetry();
            this.registerHandle();
        })
    }
}
