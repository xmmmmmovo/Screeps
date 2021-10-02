export default class HavestEvent implements IEvent {
  name = ''
  workers = []
  public trigger(): void {
    if (this.workers.length === 0) {
      this._handler()
    }
  }
  public _handler(): void {
    throw new Error('Method not implemented.')
  }
}
