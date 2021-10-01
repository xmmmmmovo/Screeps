// Memory extension samples
declare interface Memory {
  uuid: number
  log: any
  findAllocateCnt: { [key: string]: number }
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

declare interface CreepMemory {
  role: string
  room: string
  working: boolean
  target: string
}
