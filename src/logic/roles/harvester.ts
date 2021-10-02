import { harvest } from './actions/harvest'
import { storeToSpawn } from './actions/store'

// harvester用于采收到spawn中进行存储
// 类似于矿工
export const roleHarvester = {
  body: [],

  run(creep: Creep) {
    // 剩余容量还够的话
    if (creep.store.getFreeCapacity() > 0) {
      harvest(creep)
    } else {
      storeToSpawn(creep)
    }
  }
}
