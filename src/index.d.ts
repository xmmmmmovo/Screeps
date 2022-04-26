declare namespace NodeJS {
  interface Global {
    Game: Game
    Memory: Memory
    _: _.LoDashStatic
  }
}

interface Creep {
  customMove(target: RoomPosition, range: number, ignoreCreep: boolean): ScreepsReturnCode
}

interface PowerCreep {
  customMove(target: RoomPosition, range: number, ignoreCreep: boolean): ScreepsReturnCode
}
