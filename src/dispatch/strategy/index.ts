import { level0 } from './levels/level0'
import { level3 } from './levels/level3'

export interface Strategy {
  levelUpperBound: number
  run(): void
}

export const strategyList = [level3, level0]
