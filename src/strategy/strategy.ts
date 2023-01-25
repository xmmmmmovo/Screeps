export interface IStrategy {
  levelUpperBound: number
  inLoop(): void
}

export const strategyList = Array<IStrategy>()

export function registerStrategy(s: IStrategy): void {
  strategyList.push(s)
}
