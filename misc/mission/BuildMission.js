const BuildMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "BuildMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {},

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy < 10) {
            return -1;
        }
        const creepPos = creep.pos;
        let value = Game.time - self.startTime - Vector2.MapDistanceTo(self.pos, creepPos);
        value += energy + (creepPos.roomName === self.pos.roomName ? 0 : -300);
        return value;
    },

    Do_Attribute: Config.Public,
    Do: function(self, creep) {
        const obj = Game.getObjectById(self.id);
        if (!obj || self.state > 10) {
            OOP.CreepCancel(self);
            return;
        }
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        if (distance > 1) {
            OOP.CreepMoveByPath(self, creep);
        }
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy === 0) {
            if (obj.progress < obj.progressTotal) {
                self.state = 0;
                self.startTime = Game.time;
            } else {
                self.state = 10;
            }
        } else if (distance < 3) {
            const result = creep.build(obj);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
            if (obj.progress >= obj.progressTotal) {
                self.state = 10;
            }
        }
    }
}

module.exports = BuildMission;