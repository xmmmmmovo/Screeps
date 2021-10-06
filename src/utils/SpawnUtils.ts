import { BaseBody, SpawnName } from 'config'
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
    role: Role.HAVESTER,
    dst: null,
    dset: {}
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
  upperBound: number,
  body: BodyMapping
): boolean {
  const spawnPoint = getSpawn(spawnName)
  if ((counter[role] === undefined || counter[role] < upperBound) && spawnPoint.spawning === null) {
    if (
      spawnCreep(spawnPoint, bodyGenerator(body), {
        role,
        status,
        dst: null,
        dset: {}
      }) === ERR_NOT_ENOUGH_ENERGY
    )
      return false
    return true
  }
  return false
}

export function spawnDispatch(): void {
  const counter = _.countBy(Memory.creeps, 'role')
  if (spawnTask(counter, Role.HAVESTER, Status.IDLE, SpawnName, 1, BaseBody)) return
  if (spawnTask(counter, Role.UPGRADER, Status.IDLE, SpawnName, 3, BaseBody)) return
  if (spawnTask(counter, Role.BUILDER, Status.IDLE, SpawnName, 2, BaseBody)) return
}
