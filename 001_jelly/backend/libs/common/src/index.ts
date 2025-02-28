export * from './common.module';
export * from './common.service';

export * from './withCancel';
export * from './decorators';
export * from './scalars';
export * from './queues';
export * from './rmq'
export * from './pagination';

// todo move to folders
export function cleanString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
