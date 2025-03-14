import { LoggerService } from './logger.service'; // Adjust the path as needed

describe('LoggerService', () => {
    let logger: LoggerService;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('init method', () => {
        test('should resolve without error', async () => {
            logger = new LoggerService(true);
            await expect(logger.init()).resolves.toBeUndefined();
        });
    });

    describe('log method', () => {
        test('should call console.log when active is true', () => {
            logger = new LoggerService(true);
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const message = 'Test message';
            const extraArg = 'Extra argument';

            logger.log(message, extraArg);

            expect(consoleLogSpy).toHaveBeenCalledWith(message, extraArg);
            consoleLogSpy.mockRestore();
        });

        test('should not call console.log when active is false', () => {
            logger = new LoggerService(false);
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            logger.log('Test message');

            expect(consoleLogSpy).not.toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });
    });

    describe('error method', () => {
        test('should call console.error when active is true', () => {
            logger = new LoggerService(true);
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            const errorMessage = 'Error occurred';
            const extraArg = 'Extra argument';

            logger.error(errorMessage, extraArg);

            // Note: The implementation calls console.error(error, args)
            // so the extra arguments will be wrapped into an array.
            expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, [extraArg]);
            consoleErrorSpy.mockRestore();
        });

        test('should not call console.error when active is false', () => {
            logger = new LoggerService(false);
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            logger.error('Error occurred');

            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
});
