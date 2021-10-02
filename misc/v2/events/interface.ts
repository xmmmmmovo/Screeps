interface IEvent {
  name: string
  trigger(): void
  workers: string[]
  _handler(): void
}
