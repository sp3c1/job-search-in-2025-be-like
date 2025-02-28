export interface IRmqConfig {
  HOST: string;
  PORT: number;
  USERNAME: string;
  PASSWORD: string;
  PROTOCOL?: string; // 'amqp' or 'amqps'
}
