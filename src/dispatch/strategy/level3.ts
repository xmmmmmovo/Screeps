import { Strategy } from 'dispatch/strategy'

export const level3: Strategy = {
  levelUpperBound: 3,
  run(): void {
    throw new Error('Function not implemented.')
  }
}
