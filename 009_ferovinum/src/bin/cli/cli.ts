import { spawn } from 'child_process';
import {
    stdin,
    stdout,
} from 'process';
import * as readline from 'readline/promises';

import { loadEnv } from '../../config';
import { DI } from '../../di/app.di';
import {
    cO,
    cR,
} from './colors';

loadEnv();
const di = new DI(displaySystemMessage, { log: process.env.LOG_SERVER == 'true' });

const serverProcess = process.env.SOCKET_INTERNAL == 'true' ? spawn('ts-node', ['./src/bin/server/server.ts'], { stdio: 'pipe' }) : null;

const rl = readline.createInterface({
    input: stdin,
    output: stdout,
});

export function displaySystemMessage(message: string, actor: 'system' | 'cli' = 'system') {
    try {
        stdout.cursorTo(0);
        stdout.clearLine(0);
        stdout.write(`${cO(actor)}${actor}:< ${cR()}${message}\n`);
        rl.prompt(true);
    } catch (err) {
        di.loggerService.error(err);
    }
}

async function main(di: DI) {
    await di.init();
    di.apiService.registerHandle();

    rl.setPrompt(`${cO()}client:> ${cR()}`);

    while (true) {
        const input = await rl.question(rl.getPrompt());
        if (input.toLowerCase() === 'exit') {
            cleanup();
            break;
        }
        di.orderService.cmd(input);
    }
}

const cleanup = () => {
    try {
        serverProcess!.kill();
    } catch (_) { }
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);


// Start the chat session
main(di).catch(error => {
    di.loggerService.error(error);
}).finally(() => {
    try {
        rl.close();
    } catch (_) {
        //
    }
    di.loggerService.log('Session Finished. Goodbye!');
    process.exit(0);
});