import { Role, Status } from 'global'
import { Dictionary } from 'lodash'
import { BodyMapping, bodyGenerator } from 'utils/BodyUtils'

export function getSpawn(name: string): StructureSpawn {
  return Game.spawns[name]
}

export function spawnCreep(
  spawn: StructureSpawn,
  body: BodyPartConstant[],
  memory: CreepMemory = {
    status: Status.IDLE,
    role: Role.HAVESTER
  },
  name: string = nameGenerator(spawn)
): number {
  if (
    spawn.spawnCreep(body, name, {
      dryRun: true
    })
  ) {
    return ERR_NOT_ENOUGH_ENERGY
  }
  const res = spawn.spawnCreep(body, name, { memory })
  if (res === OK) {
    Memory.uuid++
    console.log(`creep ${name} spawned at ${Game.time}`)
  }
  return res
}

export function nameGenerator(spawn: StructureSpawn): string {
  return `creep ${Memory.uuid} ${spawn.room.name}`
}

export function spawnTask(
  counter: Dictionary<number>,
  role: Role,
  status: Status,
  spawnName: string,
  body: BodyMapping
): boolean {
  if (counter[role] === undefined || counter[role] < 2) {
    if (
      spawnCreep(getSpawn(spawnName), bodyGenerator(body), {
        role,
        status
      }) === ERR_NOT_ENOUGH_ENERGY
    )
      return false
  }
  return true
}
