import { level1 } from './levels/level0'
import { level3 } from './levels/level3'
import { level6 } from './levels/level6'
import { level8 } from './levels/level8'

export interface Strategy {
  levelUpperBound: number
  run(): void
}

export const strategyList = [level8, level6, level3, level1]
