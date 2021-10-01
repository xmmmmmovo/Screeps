const OperatingMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "OperatingMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {
        if (!data.pos) {
            throw Exception.New("ArgumentException", "OperatingMission not found pos.").value;
        }
        self.pos = new RoomPosition(data.pos.x, data.pos.y, data.pos.roomName); // Vector2 or data to RoomPosition
        if (!data.arriveCallback) {
            throw Exception.New("ArgumentException", "OperatingMission not found arriveCallback.").value;
        }
        self.arriveCallback = data.arriveCallback;
    },

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        const creepPos = creep.pos;
        if (creepPos.roomName !== self.pos.roomName) {
            return -1;
        }
        let value = Game.time - self.startTime;
        return value + self.weight;
    },

    Do_Attribute: Config.Public,
    Do: function(self, creep) {
        if (self.state > 10) {
            OOP.CreepCancel(self);
            return;
        }
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        if (distance <= 1) {
            self.state = self.arriveCallback(creep);
        } else {
            OOP.CreepMoveByPath(self, creep);
        }
    },
}

module.exports = OperatingMission;