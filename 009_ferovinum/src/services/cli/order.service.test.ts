import { LoggerService } from '../shared/logger.service';
import {
    ProtocolService,
    Sku,
} from '../shared/protocol.service';
import { ApiService } from './api.service';
import { OrderService } from './order.service'; // Adjust the path as needed

describe('OrderService', () => {
    let orderService: OrderService;
    let apiServiceMock: Partial<ApiService>;
    let protocolServiceMock: Partial<ProtocolService>;
    let loggerServiceMock: Partial<LoggerService>;

    beforeEach(() => {
        apiServiceMock = {
            send: jest.fn(),
        };
        protocolServiceMock = {
            getCommand: jest.fn(),
            validateCommand: jest.fn(),
        };
        loggerServiceMock = {
            log: jest.fn(),
            error: jest.fn(),
        };

        orderService = new OrderService(
            apiServiceMock as ApiService,
            protocolServiceMock as ProtocolService,
            loggerServiceMock as LoggerService
        );
    });

    describe('cmd method', () => {
        test('should not execute any command if the command is invalid', async () => {
            // Arrange: Simulate that the command is "sell" with valid arguments,
            // but the validation fails.
            (protocolServiceMock.getCommand as jest.Mock).mockReturnValue(['sell', 'sku1', '10']);
            (protocolServiceMock.validateCommand as jest.Mock).mockReturnValue(false);

            // Act
            const result = await orderService.cmd('sell sku1 10');

            // Assert
            expect(result).toBeUndefined();
            expect(apiServiceMock.send).not.toHaveBeenCalled();
        });

        test('should call sell when the command is "sell" and valid', async () => {
            // Arrange: Simulate a valid "sell" command.
            (protocolServiceMock.getCommand as jest.Mock).mockReturnValue(['sell', 'sku1', '10']);
            (protocolServiceMock.validateCommand as jest.Mock).mockReturnValue(true);

            // Act
            const result = await orderService.cmd('sell sku1 10');

            // Assert: The cmd method should dispatch to sell(), which calls apiService.send
            expect(result).toBeUndefined();
            expect(apiServiceMock.send).toHaveBeenCalledWith('sell', 'sku1', '10');
        });

        test('should call buy when the command is "buy" and valid', async () => {
            // Arrange: Simulate a valid "buy" command.
            (protocolServiceMock.getCommand as jest.Mock).mockReturnValue(['buy', 'sku2', '5']);
            (protocolServiceMock.validateCommand as jest.Mock).mockReturnValue(true);

            // Act
            const result = await orderService.cmd('buy sku2 5');

            // Assert: The cmd method should dispatch to buy(), which calls apiService.send
            expect(result).toBeUndefined();
            expect(apiServiceMock.send).toHaveBeenCalledWith('buy', 'sku2', '5');
        });
    });

    describe('sell method', () => {
        test('should call apiService.send with "sell", sku, and amount', async () => {
            // Arrange
            const sku: Sku = 'wine';
            const amount = 10;

            // Act
            await orderService.sell(sku, amount);

            // Assert
            expect(apiServiceMock.send).toHaveBeenCalledWith('sell', sku, amount);
        });
    });

    describe('buy method', () => {
        test('should call apiService.send with "buy", sku, and amount', async () => {
            // Arrange
            const sku: Sku = 'whisky';
            const amount = '5';

            // Act
            await orderService.buy(sku, amount);

            // Assert
            expect(apiServiceMock.send).toHaveBeenCalledWith('buy', sku, amount);
        });
    });
});
