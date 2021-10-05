// upgrader主要用于采集energy source到controller进行升级
// TODO: 采集满再去controller
// TODO: 如果spawn满了就先去spawn收集
export const roleUpgrader = {
  run(creep: Creep): void {
    if (creep.memory.status && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.working = false
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
      creep.memory.working = true
    }
    if (creep.memory.working) {
      upgrade(creep)
    } else {
      harvest(creep)
    }
  }
}
