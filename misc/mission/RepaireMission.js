const RepaireMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "RepaireMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {
        self.hitsMax = data.hitsMax ? data.hitsMax : 10000;
    },

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy < 10) {
            return -1;
        }
        const creepPos = creep.pos;
        let value = Game.time - self.startTime - Vector2.MapDistanceTo(self.pos, creepPos);
        value += energy + (creepPos.roomName === self.pos.roomName ? 0 : -100);
        return value;
    },
    Do_Attribute: Config.Public,
    Do: function(self, creep) {
        let obj = Game.getObjectById(self.id);
        if (!obj || self.state > 10) {
            OOP.CreepCancel(self);
            return;
        }
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        if (distance > 1) {
            OOP.CreepMoveByPath(self, creep);
        }
        if (obj.hits >= self.hitsMax || obj.hits >= obj.hitsMax) {
            RepaireMission.RedirectTarget(self, obj);
            self.path = undefined;
            if (self.id === undefined) {
                self.state = 10;
                return;
            } else {
                obj = Game.getObjectById(self.id);
            }
        }
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy === 0) {
            if (obj.hits < self.hitsMax) {
                self.state = 0;
                self.startTime = Game.time;
            } else {
                self.state = 10;
            }
            return;
        } else if (distance < 3) {
            const result = creep.repair(obj);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
        }
    },
    RedirectTarget_Attribute: Config.Private,
    RedirectTarget: function(self, creep) {
        self.id = undefined;
        const structures = creep.pos.findInRange(FIND_STRUCTURES, 2);
        for (const structure of structures) {
            if (structure.hits < self.hitsMax - 400 && structure.hits < structure.hitsMax - 400) {
                self.pos = structure.pos;
                self.id = structure.id;
                break;
            }
        }
    },
}

module.exports = RepaireMission;