import { Role } from 'creeps/roles'

export enum Status {
  IDLE,
  WORK
}

declare global {
  // Memory extension samples
  interface Memory {
    init: boolean
  }

  interface CreepMemory {
    status: Status
    role: Role
    path?: RoomPosition[]
  }

  interface PowerCreepMemory {
    status: Status
    role: Role
    path?: RoomPosition[]
  }
}

if (Memory.init === undefined) {
  console.log('init memory')
  Memory.init = true
}
