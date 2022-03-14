import { Role, Status } from 'global'

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
