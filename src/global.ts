export enum Status {
  IDLE,
  WORK
}

export enum Role {
  HAVESTER,
  BUILDER,
  CARRIER,
  UPGRADER
}

declare global {
  // Memory extension samples
  interface Memory {
    init: boolean
    uuid: number
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
  }

  interface CreepMemory {
    status: Status
    role: Role
  }
}
