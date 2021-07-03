// Memory extension samples
declare interface Memory {
  uuid: number;
  log: any;
}

declare interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  upgrading?: boolean;
}

// Syntax for adding proprties to `global` (ex "global.log")
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
