import { SpawnName } from 'config'
import { SourceConstant } from 'global'
import { getSpawn } from 'utils'
import { changeStatusHarvest, harvest } from './harvest'

export function storeToSpawnContainer(creep: Creep): void {
  if (creep.memory.dst === null || creep.memory.dst.type === SourceConstant) {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_CONTAINER ||
            structure.structureType === STRUCTURE_TOWER ||
            structure.structureType === STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        )
      }
    })
    if (targets.length > 0) {
      creep.memory.dst = {
        type: targets[0].structureType,
        pos: targets[0].pos,
        target: targets[0].id
      }
    }
  } else {
    const obj = Game.getObjectById(creep.memory.dst.target) as Structure
    if (creep.transfer(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      const { x, y } = creep.memory.dst.pos
      creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffffff' } })
    }
  }
}

export function fetchFromSpawnContainer(creep: Creep): void {
  if (
    creep.memory.dst === null ||
    (creep.memory.dst.type !== STRUCTURE_EXTENSION &&
      creep.memory.dst.type !== STRUCTURE_CONTAINER &&
      creep.memory.dst.type !== STRUCTURE_SPAWN)
  ) {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_CONTAINER ||
            structure.structureType === STRUCTURE_SPAWN) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        )
      }
    })
    if (targets.length > 0) {
      creep.memory.dst = {
        type: targets[0].structureType,
        pos: targets[0].pos,
        target: targets[0].id
      }
    }
  } else {
    const sp = getSpawn(SpawnName)
    const obj = Game.getObjectById(creep.memory.dst.target) as Structure
    if (sp.store.getUsedCapacity(RESOURCE_ENERGY) > 200)
      if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        const { x, y } = creep.memory.dst.pos
        creep.moveTo(x, y, { visualizePathStyle: { stroke: '#ffffff' } })
      }
  }
}
