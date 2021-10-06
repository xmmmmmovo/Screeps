export const upgrade = function (creep: Creep): void {
  if (creep.room.controller === undefined) {
    return
  }

  if (creep.memory.dst === null || creep.memory.dst.type !== STRUCTURE_CONTROLLER) {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType === STRUCTURE_CONTROLLER
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
    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } })
    }
  }
}
