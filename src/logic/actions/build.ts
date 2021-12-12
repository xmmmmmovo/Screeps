export const build = function (creep: Creep): void {
  if (
    creep.memory.dst === null ||
    (creep.memory.dst.type !== STRUCTURE_EXTENSION &&
      creep.memory.dst.type !== STRUCTURE_RAMPART &&
      creep.memory.dst.type !== STRUCTURE_ROAD &&
      creep.memory.dst.type !== STRUCTURE_LINK &&
      creep.memory.dst.type !== STRUCTURE_WALL &&
      creep.memory.dst.type !== STRUCTURE_TOWER &&
      creep.memory.dst.type !== STRUCTURE_OBSERVER &&
      creep.memory.dst.type !== STRUCTURE_POWER_SPAWN &&
      creep.memory.dst.type !== STRUCTURE_EXTRACTOR &&
      creep.memory.dst.type !== STRUCTURE_LAB &&
      creep.memory.dst.type !== STRUCTURE_TERMINAL &&
      creep.memory.dst.type !== STRUCTURE_NUKER &&
      creep.memory.dst.type !== STRUCTURE_FACTORY)
  ) {
    const targets = creep.room.find(FIND_CONSTRUCTION_SITES)
    if (targets.length > 0) {
      creep.memory.dst = {
        type: targets[0].structureType,
        pos: targets[0].pos,
        target: targets[0].id
      }
    }
  } else {
    const dstObj = Game.getObjectById(creep.memory.dst.target) as ConstructionSite
    if (dstObj === null) {
      creep.memory.dst = null
      return
    }
    const { x, y } = creep.memory.dst.pos
    if (creep.build(dstObj) === ERR_NOT_IN_RANGE) {
      creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffaa00' } })
    }
  }
}
