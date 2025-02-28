export interface AckRmq {
  ack: () => void;
  nack: () => void;
}
