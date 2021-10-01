const CreepComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "CreepComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const obj = Game.getObjectById(self.id);
        self.mission = undefined;
        self.bodyData = CreepComponent.ParseCreepBody(obj);
        self.objType = "Creep";
    },

    OnEnable_Attribute: Config.Public,
    OnEnable: function(self) {
        const obj = Game.getObjectById(self.id);
        self.mission = Mission.GetOneMission(obj, self);
    },
    OnDisable_Attribute: Config.Public,
    OnDisable: function(self) {
        if (self.mission && Mission.IsRunning(self.mission.GUID)) {
            OOP.CreepCancel(self.mission);
            self.mission = undefined;
        }
    },
    Update_Attribute: Config.Public,
    Update: function(self) {
        if (self.mission && (self.mission.state == 1 || self.mission.state == 10)) {} else {
            console.log("Update CreepComoponent, id : " + self.id, self.mission ? self.mission.state : 0)
        }
        const obj = Game.getObjectById(self.id);
        if (self.mission === undefined ||
            !Mission.IsRunning(self.mission.GUID)) {
            self.mission = Mission.GetOneMission(obj, self);
            if (self.mission === undefined) { // 没有任务
                return;
            }
        }
        OOP.Do(self.mission, obj);
        // 如果完成了任务，尽量执行额外的行动
        if (self.mission.state === 10) {
            self.mission = Mission.GetOneMission(obj, self);
            if (self.mission === undefined) { // 没有任务
                return;
            }
            OOP.Do(self.mission, obj);
        }
        // 做不了这个任务，归还任务
        if (self.mission.state === 0) {
            self.mission = undefined;
        }
    },
    OnDestroy_Attribute: Config.Public,
    OnDestroy(self) {
        if (self.mission && Mission.IsRunning(self.mission.GUID)) {
            OOP.CreepCancel(self.mission);
            self.mission = undefined;
        }
    },

    ParseCreepBody_Attribute: Config.Public | Config.Static,
    ParseCreepBody: function(creep) {
        const result = {
            attack: 0,
            carry: 0,
            claim: 0,
            heal: 0,
            move: 0,
            ranged_attack: 0,
            tough: 0,
            work: 0,
            size: 0,
        };
        for (const bodyContent of creep.body) {
            result[bodyContent.type]++;
            result.size++;
        }
        return result;
    }
};

module.exports = CreepComponent;