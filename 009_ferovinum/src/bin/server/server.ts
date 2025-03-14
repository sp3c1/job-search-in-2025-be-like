import net from 'net';

import { loadEnv } from '../../config';
import { ServerDI } from '../../di/server.di';
import { DELIMITER } from '../../services/shared/protocol.service';

loadEnv();

const PORT: number = Number(process.env.SOCKET_PORT) || 3001;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("Can not start without API_KEY");
}

const di = new ServerDI({ log: process.env.LOG_SERVER == 'true' });
di.logger.log('Launching server...');

async function bootstrap(di: ServerDI) {

    await di.init();

    const server = net.createServer((socket) => {
        di.logger.log('Client connected.');

        let authenticated = false;
        socket.write('Please provide API key (format: APIKEY: your-secret-key):\n');

        socket.on('data', (data: Buffer) => {
            const bufferString = data.toString().trim();

            di.logger.log(`Received from client: ${bufferString}`);

            const messages = bufferString.split(DELIMITER);

            for (const msg of messages) {
                if (!authenticated) {
                    authenticated = di.authService.auth(socket, msg);
                    continue;
                }
                const responseMsgs = di.orderService.operation(msg) || [];

                di.logger.log(`Processed response`, responseMsgs);
                for (const responsMsg of responseMsgs) {
                    socket.write(responsMsg + `\n`);
                }
            }

        });

        socket.on('end', () => {
            di.logger.log('Client disconnected.');
        });

        socket.on('error', (err: Error) => {
            di.logger.error('Socket error:', err);
        });
    });

    server.listen(PORT, () => {
        di.logger.log(`TCP server listening on port ${PORT}`);
    });

    return server;
}

bootstrap(di).catch(error => {
    di.logger.error(error)
}).finally(() => {

})