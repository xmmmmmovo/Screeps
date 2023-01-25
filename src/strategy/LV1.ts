import { IStrategy, registerStrategy } from './strategy'

class LV1Strategy implements IStrategy {
  levelUpperBound: number

  constructor() {
    this.levelUpperBound = 1
  }

  inLoop(): void {
    console.log('aaa')
  }
}

registerStrategy(new LV1Strategy())
