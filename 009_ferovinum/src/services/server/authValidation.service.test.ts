import net from 'net';

import { LoggerService } from '../shared/logger.service';
import { AuthService } from './authValidation.service'; // Adjust the path as needed

describe('AuthService', () => {
    let logger: LoggerService;
    let authService: AuthService;
    let mockSocket: Partial<net.Socket>;

    beforeEach(() => {
        // Set the API key in the environment variable for testing
        process.env.API_KEY = 'secret-key';
        logger = { log: jest.fn() } as any;
        authService = new AuthService(logger);

        // Create a mock socket with jest.fn for write and end methods
        mockSocket = {
            write: jest.fn(),
            end: jest.fn(),
        };
    });

    test('should return false and send error message if message does not start with APIKEY:', () => {
        const message = 'INVALID_MESSAGE';
        const result = authService.auth(mockSocket as net.Socket, message);

        expect(result).toBe(false);
        expect(mockSocket.write).toHaveBeenCalledWith(
            'Please authenticate using API key. Format: APIKEY: your-secret-key\n'
        );
        // Logger should not be called in this case
        expect(logger.log).not.toHaveBeenCalled();
    });

    test('should authenticate successfully when provided correct API key', () => {
        const message = 'APIKEY: secret-key';
        const result = authService.auth(mockSocket as net.Socket, message);

        expect(result).toBe(true);
        expect(mockSocket.write).toHaveBeenCalledWith(
            'Authentication successful! You are now connected.\n'
        );
        expect(logger.log).toHaveBeenCalledWith('Client authenticated successfully.');
    });

    test('should reject authentication with wrong API key and close socket', () => {
        const message = 'APIKEY: wrong-key';
        const result = authService.auth(mockSocket as net.Socket, message);

        expect(result).toBe(false);
        expect(mockSocket.write).toHaveBeenCalledWith(
            'Invalid API key. Connection will be closed.\n'
        );
        expect(logger.log).toHaveBeenCalledWith('Client provided an invalid API key.');
        expect(mockSocket.end).toHaveBeenCalled();
    });
});
