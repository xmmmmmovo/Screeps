import { SpawnName } from 'core/constant'
import { bodyGenerator } from 'creeps/body-generator'
import { Role, RoleNumBodyMap } from 'creeps/roles'
import { getSpawn, spawnDispatch } from 'creeps/spawn'
import { Strategy } from 'dispatch/strategy'
import { Status } from 'global'

const roleNumBodyMap: RoleNumBodyMap = {
  miner: { num: 4, body: bodyGenerator({}) },
  builder: { num: 4, body: bodyGenerator({}) },
  upgrader: { num: 4, body: bodyGenerator({}) },
  repairer: { num: 2, body: bodyGenerator({}) }
}

export const level1: Strategy = {
  levelUpperBound: 1,
  run(): void {
    const spawn = getSpawn(SpawnName)
    spawnDispatch(spawn, (): [CreepMemory, BodyPartConstant[]] | null => {
      for (const [k, v] of Object.entries(_.countBy(Memory.creeps, 'role'))) {
        const tmp = roleNumBodyMap[k as Role]
        if (tmp === undefined) return null
        if (v < tmp.num) {
          return [
            {
              status: Status.IDLE,
              role: k as Role
            },
            tmp.body
          ]
        }
      }
      return null
    })
  }
}
