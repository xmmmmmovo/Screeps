import { Role } from 'creeps/roles'
import { Strategy } from 'dispatch/strategy'

const roleNumMap: Readonly<{ [key in Role]?: number }> = {
  miner: 4,
  builder: 4,
  upgrader: 4,
  repairer: 2
}

export const level1: Strategy = {
  levelUpperBound: 1,
  run(): void {
    const counter = _.countBy(Memory.creeps, 'role')
  }
}
