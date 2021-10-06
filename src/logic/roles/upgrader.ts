import { Status } from 'global'
import { fetchFromSpawnContainer, upgrade } from 'logic/actions'

// upgrader主要用于采集energy source到controller进行升级
export const roleUpgrader = {
  run(creep: Creep): void {
    if (creep.store.getFreeCapacity() === 0) {
      creep.memory.status = Status.WORK
    } else if (creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.status = Status.IDLE
    }
    if (creep.memory.status === Status.WORK) {
      upgrade(creep)
    } else {
      fetchFromSpawnContainer(creep)
    }
  }
}
