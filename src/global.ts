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

export type TDstType = {
  [key in StructureConstant | ResourceConstant | SourceConstant]: {
    [roomName: string]: {
      [index in Id<Structure | Source | Resource> | any]: number
    }
  }
}

export type TTarget = Id<Source | Structure | Resource | Deposit | ConstructionSite<BuildableStructureConstant>>

export type SourceConstant = 'source'
export const SourceConstant: SourceConstant = 'source'

declare global {
  // Memory extension samples
  interface Memory {
    init: boolean
    uuid: number
    dstCounter: TDstType
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
    dst: null | {
      type: StructureConstant | ResourceConstant | SourceConstant
      pos: RoomPosition
      // 无法序列化游戏object
      target: TTarget
    }
    dset: {
      [id in TTarget | any]: {
        rname: string
        type: StructureConstant | ResourceConstant | SourceConstant
      }
    }
  }
}
