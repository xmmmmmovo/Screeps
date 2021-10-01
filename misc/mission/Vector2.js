global.Vector2RoomPosition = {}

const Vector2 = {
  _Attribute: Config.Public | Config.Struct,
  base: undefined,
  typeName: 'Vector2',
  typeIndex: undefined,
  staticCtor(data) {},

  __init(self, data) {
    if (data.pos) {
      self.x = data.pos.x ? data.pos.x : 0
      self.y = data.pos.y ? data.pos.y : 0
      self.roomName = data.pos.roomName
    } else if (data.x) {
      self.x = data.x ? data.x : 0
      self.y = data.y ? data.y : 0
      self.roomName = data.roomName
    } else {
      throw Exception.New('ArgumentException', 'argument type is ' + typeof x + ', ' + typeof y).value
    }
  },

  DistanceTo_Attribute: Config.Public,
  DistanceTo(self, another) {
    const deltaX = another.x > self.x ? another.x - self.x : self.x - another.x
    const deltaY = another.y > self.y ? another.y - self.y : self.y - another.y
    return deltaX > deltaY ? deltaX : deltaY
  },
  DistanceToXY_Attribute: Config.Public,
  DistanceToXY(self, x, y) {
    const deltaX = x > self.x ? x - self.x : self.x - x
    const deltaY = y > self.y ? y - self.y : self.y - y
    return deltaX > deltaY ? deltaX : deltaY
  },
  DistanceToObj_Attribute: Config.Public,
  DistanceToObj(self, obj) {
    const pos = obj.pos
    const deltaX = pos.x > self.x ? pos.x - self.x : self.x - pos.x
    const deltaY = pos.y > self.y ? pos.y - self.y : self.y - pos.y
    return deltaX > deltaY ? deltaX : deltaY
  },
  MapDistanceTo_Attribute: Config.Public,
  MapDistanceTo(self, another) {
    const anotherRoomPosition = Vector2.ToRoomPosition(another.roomName)
    const thisRoomPosition = Vector2.ToRoomPosition(self.roomName)
    let deltaX = anotherRoomPosition[0] + another.x - thisRoomPosition[0] - self.x
    deltaX = deltaX > 0 ? deltaX : -deltaX
    let deltaY = anotherRoomPosition[1] + another.y - thisRoomPosition[1] - self.y
    deltaY = deltaY > 0 ? deltaY : -deltaY
    return deltaX > deltaY ? deltaX : deltaY
  },
  ToRoomPosition_Attribute: Config.Public | Config.Static,
  ToRoomPosition(roomName) {
    let roomPosition = Vector2RoomPosition[roomName]
    if (roomPosition) {
      return roomPosition
    }
    roomPosition = Vector2RoomPosition[roomName] = [0, 0]
    let flag = -1
    for (let index = 0; index < roomName.length; index++) {
      switch (roomName.charCodeAt(index)) {
        case 87: // W
          roomPosition[0] = -1
          break
        case 69: // E
          roomPosition[0] = 1
          break
        case 78: // N
          roomPosition[1] = 1
          flag = index
          break
        case 83: // S
          roomPosition[1] = -1
          flag = index
          break
        default:
          break
      }
    }
    roomPosition[0] *= (parseInt(roomName.substring(1, flag)) + (roomPosition[0] < 0 ? 1 : 0)) * 50
    roomPosition[1] *= (parseInt(roomName.substring(flag + 1)) + (roomPosition[1] < 0 ? 1 : 0)) * 50
    return roomPosition
  },
  ToRoom_Attribute: Config.Public | Config.Static,
  ToRoom(data) {
    new RoomPosition(data.x, data.y, data.roomName)
  }
}

module.exports = Vector2
