import { GenericService } from '../generic';

export class LoggerService implements GenericService {
    constructor(public active: boolean = true) { }

    async init() { }

    public log(message: unknown, ...args: any[]) {
        if (this.active) {
            console.log(message, ...args);
        }
    }

    public error(error: unknown, ...args: any[]) {
        if (this.active) {
            console.error(error, args);
        }
    }
}