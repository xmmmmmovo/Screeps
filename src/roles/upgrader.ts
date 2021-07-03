import { harvest } from "./actions/harvest";
import { upgrade } from "./actions/upgrade";

// upgrader主要用于采集energy source到controller进行升级
// TODO: 采集满再去controller
// TODO: 如果spawn满了就先去spawn收集
export const roleUpgrader = {
  run: function (creep: Creep) {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    if (creep.memory.upgrading) {
      upgrade(creep);
    } else {
      harvest(creep);
    }
  }
};
