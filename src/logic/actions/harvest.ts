import { SourceConstant } from 'global'

export function harvest(creep: Creep): void {
  let counter = Memory.dstCounter.source[creep.room.name]
  if (counter === undefined) {
    Memory.dstCounter.source[creep.room.name] = {}
  }
  counter = {}
  if (creep.memory.dst === null || creep.memory.dst.type !== SourceConstant) {
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
    if (creep.harvest(Game.getObjectById(creep.memory.dst.target) as Source) === ERR_NOT_IN_RANGE) {
      const { x, y } = creep.memory.dst.pos
      creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffaa00' } })
    }
  }
}
