import { Role } from 'creeps/roles'

export enum Status {
  IDLE,
  WORK
}

declare global {
  // Memory extension samples
  interface Memory {
    init: boolean
    stats: {
      time: number
      gcl: {
        progress: number
        progressTotal: number
        level: number
      }
      rooms: {
        [key: string]: {
          storageEnergy: number
          terminalEnergy: number
          energyAvailable: number
          energyCapacityAvailable: number
          controllerProgress: number | undefined
          controllerProgressTotal: number | undefined
          controllerLevel: number | undefined
        }
      }
      cpu: {
        bucket: number
        limit: number
        used: number
      }
    }
    mission: Record<string, unknown>
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
  Memory.mission = {}
}
