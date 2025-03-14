import { GenericService } from '../generic';
import { LoggerService } from '../shared/logger.service';
import {
    ProtocolService,
    Sku,
} from '../shared/protocol.service';
import { ApiService } from './api.service';

export class OrderService implements GenericService {
    constructor(
        private apiService: ApiService,
        private protocolServie: ProtocolService,
        private loggerService: LoggerService
    ) { }

    public async init() { }

    public async cmd(message: string) {
        const [cmd, ...args] = this.protocolServie.getCommand(message);
        const validCmd = this.protocolServie.validateCommand(cmd, ...args);

        if (!validCmd) {
            return;
        }

        return this?.[cmd](...args);
    }

    public async sell(sku: Sku, amount: number | string) {
        this.apiService.send('sell', sku, amount);
    }

    public async buy(sku: Sku, amount: number | string) {
        this.apiService.send('buy', sku, amount);
    }

}