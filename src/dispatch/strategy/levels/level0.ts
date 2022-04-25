import { Strategy } from 'dispatch/strategy'

export const level0: Strategy = {
  levelUpperBound: 0,
  run(): void {
    throw new Error('Function not implemented.')
  }
}
