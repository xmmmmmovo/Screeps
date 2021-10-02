interface IQueue<T> {
  push(val: T): void
  pop(): T | undefined
  size(): number
}

// 这里不需要考虑并发问题
// 在screeps里面运行机制类似mc tps
export class Queue<T> implements IQueue<T> {
  private _store: T[] = []

  public push(val: T): void {
    this._store.push(val)
  }

  public pop(): T | undefined {
    return this._store.shift()
  }

  public size(): number {
    return this._store.length
  }
}
