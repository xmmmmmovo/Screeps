const UpgradeMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "UpgradeMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {},

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        const obj = Game.getObjectById(self.id);
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy < 10) {
            return -1;
        }
        const creepPos = creep.pos;
        const distance = Vector2.MapDistanceTo(self.pos, creepPos);
        let value = 0;
        value = Game.time - self.startTime - distance;
        value += energy + self.weight + (obj.ticksToDowngrade < 8000 ? 500 : 0) + (creepPos.roomName === self.pos.roomName ? 0 : -500);
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
        if (distance > 2) {
            OOP.CreepMoveByPath(self, creep);
        }
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy === 0) {
            self.state = 10;
            return;
        } else if (distance < 3) {
            const result = creep.upgradeController(obj);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
        }
    }
};
module.exports = UpgradeMission;