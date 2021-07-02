// upgrader主要用于采集energy source到controller进行升级
// TODO: 采集满再去controller
// TODO: 如果spawn满了就先去spawn收集
export const roleUpgrader = {
  run: function (creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0]);
      }
    } else {
      if (creep.room.controller === undefined) {
        return;
      }
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
  }
};
