class Queue<T> {
  private _store: T[] = [];

  push(val: T) {
    this._store.push(val);
  }

  pop(): T | undefined {
    return this._store.shift();
  }
}
