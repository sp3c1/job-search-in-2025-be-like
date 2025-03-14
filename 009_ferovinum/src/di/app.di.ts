import { ApiService } from '../services/cli/api.service';
import { OrderService } from '../services/cli/order.service';
import { LoggerService } from '../services/shared/logger.service';
import { ProtocolService } from '../services/shared/protocol.service';

export class DI {
    public protocolService: ProtocolService;
    public loggerService: LoggerService;

    public apiService: ApiService;
    public orderService: OrderService;

    constructor(public cliHandle: (message: string) => void, opts: { log: boolean }) {
        this.protocolService = new ProtocolService();
        this.loggerService = new LoggerService(opts.log);

        this.apiService = new ApiService(cliHandle, this.protocolService, this.loggerService);
        this.orderService = new OrderService(this.apiService, this.protocolService, this.loggerService);
    }

    async init() {
        await Promise.all([
            // internal
            this.protocolService.init(),
            this.loggerService.init(),
            // services
            this.apiService.init(),
            this.orderService.init()
        ])
    }
}