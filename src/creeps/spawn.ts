import { logger } from 'core/logger'
import { Status } from 'global'
import { Role, RoleNumBodyMap } from './roles'

export function getSpawn(name: string): StructureSpawn {
  return Game.spawns[name]
}

export function spawnCreep(
  spawn: StructureSpawn,
  body: BodyPartConstant[],
  memory: CreepMemory,
  name: string = nameGenerator(spawn, memory.role)
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
    console.log(`creep ${name} spawned at ${Game.time}`)
  }
  return res
}

export function nameGenerator(spawn: StructureSpawn, role: Role): string {
  return `creep ${Game.time} ${spawn.room.name} ${role}`
}

export function spawnDispatch(
  spawn: StructureSpawn,
  getCreepsDetailFunc: () => [CreepMemory, BodyPartConstant[]] | null
): void {
  if (spawn.spawning) {
    return
  }
  const res = getCreepsDetailFunc()
  if (res === null) return
  const ret = spawnCreep(spawn, res[1], res[0])
  if (ret === OK) {
    logger.error('spawn error: ', ret)
  }
}
