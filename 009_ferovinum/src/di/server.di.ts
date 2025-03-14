import { AuthService } from '../services/server/authValidation.service';
import { OrderService } from '../services/server/order.service';
import { LoggerService } from '../services/shared/logger.service';
import { ProtocolService } from '../services/shared/protocol.service';

export class ServerDI {
    public protocolService: ProtocolService;
    public logger: LoggerService
    public authService: AuthService;
    public orderService: OrderService;

    constructor(opts: { log: boolean }) {
        this.protocolService = new ProtocolService();
        this.logger = new LoggerService(opts.log);
        this.authService = new AuthService(this.logger);
        this.orderService = new OrderService(this.protocolService);
    }

    async init() {
        await Promise.all([
            // internal
            this.protocolService.init(),
            this.logger.init(),

            // services
            this.authService.init(),
            this.orderService.init()

        ])
    }
}