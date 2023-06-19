export interface ISleepingServer {
  init: () => Promise<void>;
  close: () => Promise<void>;
}
