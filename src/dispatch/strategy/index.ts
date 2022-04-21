import { level3 } from './level3'

export interface Strategy {
  levelUpperBound: number
  run(): void
}

export const strategyList = [level3]
