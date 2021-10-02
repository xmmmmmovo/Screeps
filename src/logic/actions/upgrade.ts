export const upgrade = function (creep: Creep) {
  if (creep.room.controller === undefined) {
    return
  }
  if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } })
  }
}
