const RealDate = Date;

class FixedDate extends RealDate {
    constructor(...args: any[]) {
        super('2025-01-01T00:00:00Z');
    }

    static now(): number {
        return new RealDate('2025-01-01T00:00:00Z').getTime();
    }
}

export function replaceTimer() {
    (global as any).Date = FixedDate;
}

export function restoreTimer() {
    (global as any).Date = RealDate;
}
