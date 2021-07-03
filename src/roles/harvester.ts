// harvester用于采收到spawn中进行存储

import { harvest, storeToSpawn } from "./actions/harvest";

// 类似于矿工
export const roleHarvester = {
  run: function (creep: Creep) {
    // 剩余容量还够的话
    if (creep.store.getFreeCapacity() > 0) {
      harvest(creep);
    } else {
      storeToSpawn(creep);
    }
  }
};
