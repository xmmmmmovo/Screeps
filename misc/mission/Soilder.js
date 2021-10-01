const Soilder = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "Soilder",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const obj = Game.getObjectById(self.id);
        self.pos = data.pos ? data.pos : obj.pos;
        self.bodyData = CreepComponent.ParseCreepBody(obj);
        self.objType = "Creep";
        self.attackTarget = undefined;
        self.targetType = undefined;
    },

    Update_Attribute: Config.Public,
    Update: function(self) {
        const armyGroup = MonoBehaviour.GetById(Memory.ArmyGroup.GUID);
        OOP.RunSoilder(armyGroup, self);
    },
    Goto_Attribute: Config.Public,
    Goto: function(self, maxDistance) {
        const creep = Game.getObjectById(self.id);
        if (!self.pos) {
            return;
        }
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        if (distance > maxDistance) {
            const result = creep.moveTo(self.pos);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
        }
        return distance;
    },
    Attack_Attribute: Config.Public,
    Attack: function(self, attackType) {
        const creep = Game.getObjectById(self.id);
        let target;
        if (self.targetType === attackType) {
            target = Game.getObjectById(self.attackTarget);
        } else {
            self.attackTarget = undefined;
        }
        self.targetType = attackType;
        let targetPos = self.pos;
        if (!target) {
            self.attackTarget = undefined;
            self.targetType = undefined;
            target = creep.pos.findClosestByRange(attackType, 5);
            if (target) {
                targetPos = target.pos;
                self.attackTarget = target.id;
            }
        }
        let result = creep.attack(target);
        if (result === OK) {
            Statistics.APICost += 0.2;
        }
        result = creep.moveTo(targetPos);
        if (result === OK) {
            Statistics.APICost += 0.2;
        }
    },
    Do_Attribute: Config.Public,
    Do: function(self, obj) {
        let target
        const creepList = obj.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
        target = creepList.length > 0 ? creepList[0] : undefined;
        if (!target) {
            // const spawnList = obj.pos.findInRange(FIND_HOSTILE_SPAWNS, 7);
            const spawnList = obj.pos.findInRange(FIND_HOSTILE_STRUCTURES, 7);
            target = spawnList.length > 0 ? spawnList[0] : undefined;
        }
        if (!target) {
            Soilder.Goto(self, obj, 3);
            return;
        } else {
            const result = obj.attack(target);
            if (result === OK) {
                Statistics.APICost += 0.2;
            } else if (result === ERR_NOT_IN_RANGE) {
                obj.moveTo(target);
            }
        }
    }
}
module.exports = Soilder;