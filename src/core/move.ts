interface Creep {
  customMove(target: RoomPosition, range: number, ignoreCreep: boolean): ScreepsReturnCode
}

Creep.prototype.customMove = function (target: RoomPosition, range = 1, ignoreCreep = true): ScreepsReturnCode {
  if (!this.memory.path || !this.memory.path.length) {
    return OK
  } else if (this.pos.x === this.memory.path[0].x && this.pos.y === this.memory.path[0].y) {
    this.memory.path.shift()
  }
  const next = this.memory.path[0]
  const curr = this.pos
  if (next) {
    if (Math.abs(curr.x - next.x) <= 1 && Math.abs(curr.y - next.y) <= 1) {
      let obstacle: Creep[] | PowerCreep[] = this.room.lookForAt(LOOK_CREEPS, next.x, next.y)
      if (!obstacle.length) obstacle = this.room.lookForAt(LOOK_POWER_CREEPS, next.x, next.y)
      if (obstacle.length) {
        if (this.memory.state == obstacle[0].memory.state || obstacle[0].memory.state == 'Harvest') {
          obstacle[0].memory.path = null
          obstacle[0].customMove(target, range - 1 <= 1 ? 1 : range - 1, false)
        } else {
          const dir = obstacle[0].pos.getDirectionTo(curr.x, curr.y)
          obstacle[0].move(dir)
          if (obstacle[0].memory.path && obstacle[0].memory.path.length) obstacle[0].memory.path.shift()
        }
      }
      const dir = creep.pos.getDirectionTo(creep.memory.path[0].x, creep.memory.path[0].y)
      return creep.move(dir)
    } else {
      delete this.memory.path
      return OK
    }
  }
  return OK
}
