// harvester用于采收到spawn中进行存储
import { harvest, storeToSpawnContainer } from 'logic/actions'

// 类似于矿工
export const roleHarvester = {
  run(creep: Creep): void {
    // 剩余容量还够的话
    if (creep.store.getFreeCapacity() > 0) {
      harvest(creep)
    } else {
      storeToSpawnContainer(creep)
    }
    return
  }
}
