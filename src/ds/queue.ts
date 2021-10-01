//这里不需要考虑并发问题
//在screeps里面运行机制类似mc tps
class Queue<T> {
  private _store: T[] = []

  push(val: T) {
    this._store.push(val)
  }

  pop(): T | undefined {
    return this._store.shift()
  }
}
