import { SourceConstant } from 'global'

export const storeToSpawnContainer = function (creep: Creep): void {
  if (creep.memory.dst === null || creep.memory.dst.type === SourceConstant) {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_CONTAINER ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        )
      }
    })
    if (targets.length > 0) {
      creep.memory.dst = {
        type: targets[0].structureType,
        pos: targets[0].pos,
        target: targets[0].id
      }
    }
  } else {
    if (
      creep.transfer(Game.getObjectById(creep.memory.dst.target) as Structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
    ) {
      const { x, y } = creep.memory.dst.pos
      creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffffff' } })
    }
  }
}
