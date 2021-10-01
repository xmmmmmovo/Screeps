const ClaimMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "ClaimMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {},

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        let value = Vector2.MapDistanceTo(self.pos, creep.pos);
        return value + 1000;
    },

    Do_Attribute: Config.Public,
    Do: function(self, creep) {
        // 没有视野拿不到，先走过去
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        if (distance > 1) {
            OOP.CreepMoveByPath(self, creep);
            return;
        }

        const obj = Game.getObjectById(self.id);
        if (!obj || self.state > 10) {
            OOP.CreepCancel(self);
            return;
        }
        if (obj.my) {
            self.state = 10;
            return;
        }
        const result = creep.claimController(obj);
        if (result === OK) {
            Statistics.APICost += 0.2;
        }
    }
}

module.exports = ClaimMission;