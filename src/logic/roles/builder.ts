import { Status } from 'global'
import { build, fetchFromSpawnContainer } from 'logic/actions'

export const roleBuilder = {
  run(creep: Creep): void {
    if (creep.store.getFreeCapacity() === 0) {
      creep.memory.status = Status.WORK
    } else if (creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.status = Status.IDLE
    }
    if (creep.memory.status === Status.WORK) {
      build(creep)
    } else {
      fetchFromSpawnContainer(creep)
    }
  }
}
