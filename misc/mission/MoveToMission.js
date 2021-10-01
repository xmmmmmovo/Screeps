const MoveToMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "MoveToMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {
        self.roomName = data.roomName;
        self.nearlyDistance = data.nearlyDistance ? data.nearlyDistance : 0;
    },

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        let value = Game.time - self.startTime - Vector2.MapDistanceTo(self.pos, creep.pos);
        return value;
    },

    Do_Attribute: Config.Public,
    Do: function(self, creep) {
        if (Vector2.MapDistanceTo(self.pos, creep.pos) <= self.nearlyDistance) {
            self.state = 10;
        } else {
            OOP.CreepMoveByPath(self, creep);
        }
    }
}

module.exports = MoveToMission;