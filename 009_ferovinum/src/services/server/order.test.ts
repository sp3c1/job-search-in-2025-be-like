import { ProtocolService } from '../shared/protocol.service';
import { OrderService } from './order.service';

describe('OrderService Test', () => {
    describe('dry run', () => {
        const orderService = new OrderService(new ProtocolService());
        it(`sell wine 1000`, () => {
            const output = orderService.operation(`sell wine 1000`);
            expect(output).toMatchSnapshot();
        });

        it(`sell whisky 100`, () => {
            const output = orderService.operation(`sell whisky 100`);
            expect(output).toMatchSnapshot();
        });

        it(`buy wine 500`, () => {
            const output = orderService.operation(`buy wine 500`);
            expect(output).toMatchSnapshot();
        });

        it(`buy wine 1000`, () => {
            const output = orderService.operation(`buy wine 1000`);
            expect(output).toMatchSnapshot();
        });

        it(`buy another wine 500`, () => {
            const output = orderService.operation(`buy wine 500`);
            expect(output).toMatchSnapshot();
        });

        it(`sell whisky 100`, () => {
            const output = orderService.operation(`sell whisky 100`);
            expect(output).toMatchSnapshot();
        });

        it(`buy whisky 120`, () => {
            const output = orderService.operation(`buy whisky 120`);
            expect(output).toMatchSnapshot();
        });
    });

})