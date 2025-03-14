// Define ANSI color codes
export const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
} as const;

export function cO(actor: 'system' | 'cli' | 'client' = 'client') {
    if (process.env.COLORS !== 'true') {
        return ``;
    }

    if (actor == 'system') {
        return colors.yellow;
    }

    if (actor == 'client') {
        return colors.green;
    }

    return colors.cyan;
}

export function cR() {
    if (process.env.COLORS !== 'true') {
        return ``;
    }

    return colors.reset;
}