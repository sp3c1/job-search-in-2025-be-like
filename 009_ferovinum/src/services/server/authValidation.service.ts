import net from 'net';

import { GenericService } from '../generic';
import { LoggerService } from '../shared/logger.service';

export class AuthService implements GenericService {
    private apiKey: string;

    constructor(private logger: LoggerService) {
        this.apiKey = process.env.API_KEY!;
    }

    async init() { }

    public auth(socket: net.Socket, message: string,) {
        if (!message.startsWith('APIKEY:')) {
            socket.write('Please authenticate using API key. Format: APIKEY: your-secret-key\n');
            return false;
        }
        const providedKey = message.substring('APIKEY:'.length).trim();
        if (providedKey === this.apiKey) {
            socket.write('Authentication successful! You are now connected.\n');
            this.logger.log('Client authenticated successfully.');
            return true;
        }

        socket.write('Invalid API key. Connection will be closed.\n');
        this.logger.log('Client provided an invalid API key.');
        socket.end();
        return false;
    }
}
