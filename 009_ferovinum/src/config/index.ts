import { loadEnvFile } from 'process';

export function loadEnv(filePath: string = '.env'): void {
    try {
        loadEnvFile(filePath);
    } catch (err) {
        console.error(err);
    }
}
