import { GenericService } from '../generic';

export type Sku = 'wine' | 'whisky';
export type CommandArgs = {
    buy: [sku: Sku, amount: string | number, status?: string];
    sell: [sku: Sku, amount: string | number, status?: string];
};

export type Command = keyof CommandArgs;

export const DELIMITER = '\n';

export interface GenericCmd {
    buy: (sku: Sku, amount: string | number) => string[] | undefined
    sell: (sku: Sku, amount: string | number) => string[] | undefined
}

/** if allowed to use libraries, would do cap'n'proto or protobuf and straight gRpc */
export class ProtocolService implements GenericService {
    constructor() { };

    public async init() { }

    public parseBuffer(buff: Buffer) {
        const deserialized = buff?.toString?.() ?? '';
        this.parseString(deserialized);
    }

    public parseString(message: string = '') {
        const [cmd, ...args] = this.getCommand(message);
        this.validateCommand(cmd, ...args);
    }

    getCommand(message: string = '') {
        return <[Command, Sku, string]>message.trim().replace(/\s{1,}/gi, " ").split(" ");
    }

    getCommandWithValidate(message: string = '') {
        const [cmd, ...args] = this.getCommand(message);
        if (this.validateCommand(cmd, ...args)) {
            return [cmd, ...args];
        }
    }

    public validateCommand<C extends keyof CommandArgs>(cmd: C, ...args: CommandArgs[C]) {
        if (!["sell", "buy"].includes(cmd)) {
            return
        }

        return [
            cmd,
            ...args,
        ].join(" ");
    }
}