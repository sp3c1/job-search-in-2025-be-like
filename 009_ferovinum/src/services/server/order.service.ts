import { GenericService } from '../generic';
import {
    Command,
    GenericCmd,
    ProtocolService,
    Sku,
} from '../shared/protocol.service';

interface Op {
    cmd: Command,
    sku: string,
    initial: number,
    current: number,
}


class UnclosedOperationsIterator {

    constructor(private sku: string, private operations: Op[] = [], private key = 0) { }

    next() {
        for (const key in this.operations) {
            if (this.operations[key].sku !== this.sku) {
                continue;
            }

            if (this.operations[key].cmd == 'buy') {
                continue
            }

            if (this.operations[key].cmd == 'sell' && this.operations[key].initial - this.operations[key].current > 0) {
                this.key = +key + 1;
                return this.operations[key]
            }
        }
        return null;
    }

    hasNext() {
        return this.key + 1 < this.operations.length;
    }
}

export class OrderService implements GenericService, GenericCmd {
    // future work would be to split operations to 'sku' based hash with array of operations
    // but without store here, or any persistance, it does not matter here that much in my opinion
    private operations: Op[] = [];

    //v2
    // private unclosedRef: Record<Sku, number> = {
    //     'wine': 0,
    //     'whisky': 0
    // }

    constructor(private protocolService: ProtocolService) { }

    async init() { }

    public operation(message: string) {
        const [cmd, ...args] = this.protocolService.getCommand(message);
        return this[cmd]?.(...args);
    }

    public buy(sku: Sku, amount: string | number) {
        if (!this.isSkuOk(sku)) {
            return;
        }

        amount = Math.round(+amount || 0);
        let amounLeft = +amount;

        if (!amount) {
            return;
        }

        // v1
        // for (const operation of this.operations) {
        //     if (amounLeft <= 0) {
        //         break;
        //     }

        //     if (operation.cmd == 'buy') {
        //         continue;
        //     }

        //     if (operation.sku != sku) {
        //         continue;
        //     }

        //     const delta = Math.round(operation.initial - operation.current);
        //     if (delta <= 0) {
        //         continue
        //     }

        //     operation.current = Math.min(operation.initial, operation.current + amounLeft);
        //     amounLeft = Math.max(amounLeft - delta, 0);
        // }

        // v2
        // start on last unclosed position
        // assume that would be limited to the window of data fetched from datasource

        // for (let i = this.unclosedRef[sku]; i < this.operations.length; i++) {
        //     if (amounLeft <= 0) {
        //         break;
        //     }

        //     const operation = this.operations[i];
        //     if (operation.cmd == 'buy') {
        //         continue;
        //     }

        //     if (operation.sku != sku) {
        //         continue;
        //     }


        //     const delta = Math.round(operation.initial - operation.current);
        //     if (delta <= 0) {
        //         continue
        //     }

        //     operation.current = Math.min(operation.initial, operation.current + amounLeft);

        //     if (operation.current == operation.initial) {
        //         // if on last it will dissable the loop untill new entry jumps in;
        //         this.unclosedRef[sku] = i + 1;
        //     }

        //     amounLeft = Math.max(amounLeft - delta, 0);
        // }

        // v3 
        // live session
        const interator = new UnclosedOperationsIterator(sku, this.operations);
        while (interator.hasNext()) {
            const unclosedSellOp = interator.next();
            if (!unclosedSellOp) {
                break;
            }

            if (amounLeft <= 0) {
                break;
            }

            const delta = Math.round(unclosedSellOp.initial - unclosedSellOp.current);
            if (delta <= 0) {
                continue
            }

            unclosedSellOp.current = Math.min(unclosedSellOp.initial, unclosedSellOp.current + amounLeft);

            amounLeft = Math.max(amounLeft - delta, 0);
        }

        if (amount != amounLeft) {
            this.operations.push(
                {
                    cmd: 'buy',
                    sku,
                    initial: Math.round(Number(amount)),
                    current: amount - amounLeft
                }
            );
        }

        return this.printState();
    }

    public sell(sku: Sku, amount: string | number) {
        if (!this.isSkuOk(sku)) {
            return;
        }

        this.operations.push(
            {
                cmd: 'sell',
                sku,
                initial: Math.round(+amount || 0),
                current: 0
            }
        );

        return this.printState();
    }

    private printState() {
        const values = this.operations.map(op => {
            const cmd = `${op.cmd}`;
            const sku = `${op.sku}`;
            // buy should show how much was baught
            const initial = cmd == 'sell' ? op.initial : op.current;
            // buy is always closed
            // sell will give amount or closed depending on stock
            const status = cmd == 'sell' && op.initial - op.current > 0 ? `remaining: ${op.initial - op.current} ` : `closed `;
            return `${cmd} ${sku} ${initial} ${status}`;
        })

        return values;
    }

    private isSkuOk(sku: unknown) {
        return (<Sku[]>['whisky', 'wine']).includes(sku as Sku);
    }
}