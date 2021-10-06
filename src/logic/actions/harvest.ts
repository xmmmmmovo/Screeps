import { SourceConstant } from 'global'

export function harvest(creep: Creep): void {
  let counter = Memory.dstCounter.source[creep.room.name]
  if (counter === undefined) {
    Memory.dstCounter.source[creep.room.name] = {}
    counter = {}
  }
  if (
    (creep.memory.dst === null || creep.memory.dst.type !== SourceConstant) &&
    Object.keys(creep.memory.dset).length === 0
  ) {
    const sources = creep.room.find(FIND_SOURCES)
    _.every(sources, (source): boolean => {
      if (counter[source.id] === undefined || counter[source.id] < 2) {
        if (counter[source.id] === undefined) {
          Memory.dstCounter.source[creep.room.name][source.id] = 1
        } else {
          Memory.dstCounter.source[creep.room.name][source.id] += 1
        }
        creep.memory.dst = {
          type: SourceConstant,
          pos: source.pos,
          target: source.id
        }
        if (creep.memory.dset[source.id] === undefined) {
          creep.memory.dset[source.id] = { rname: source.room.name, type: SourceConstant }
        }
        return false
      }
      return true
    })
  } else {
    changeStatusHarvest(creep, SourceConstant)
  }
}

export function changeStatusHarvest(creep: Creep, type: SourceConstant | Deposit): void {
  // 交给下一个tick处理
  if (creep.memory.dst === null) return
  if (creep.memory.dst.type !== SourceConstant) {
    const dstObj = Game.getObjectById(Object.keys(creep.memory.dset)[0]) as Source
    creep.memory.dst = {
      type: SourceConstant,
      pos: dstObj.pos,
      target: dstObj.id
    }
    const { x, y } = dstObj.pos
    moveAndHarvest(creep, dstObj, x, y)
  } else {
    const dstObj = Game.getObjectById(creep.memory.dst.target)
    const { x, y } = creep.memory.dst.pos
    moveAndHarvest(creep, dstObj as Source, x, y)
  }
}

function moveAndHarvest(creep: Creep, obj: Source | Deposit, x: number, y: number) {
  if (creep.harvest(obj) === ERR_NOT_IN_RANGE) {
    creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffaa00' } })
  }
}
