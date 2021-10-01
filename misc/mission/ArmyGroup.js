if (Memory.ArmyGroup === undefined) {
    Memory.ArmyGroup = {
        state: Config.Army.None,
        totalDistance: 0,
        maxDistance: 0,
        soilderCount: 0,
        FIND_HOSTILE_CREEPS: FIND_HOSTILE_CREEPS,
        FIND_HOSTILE_SPAWNS: FIND_HOSTILE_SPAWNS,
        FIND_HOSTILE_STRUCTURES: FIND_HOSTILE_STRUCTURES,
        find: FIND_HOSTILE_CREEPS,
        pos: Config.Army.migratePoints[0],
        None: Config.Army.None,
        Migrate: Config.Army.Migrate,
        Attack: Config.Army.Attack,
    }
}

const ArmyGroup = {
    _Attribute: Config.Public,
    base: 'MonoBehaviour',
    typeName: 'ArmyGroup',
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        self.migratePoints = Config.Army.migratePoints;
        self.totalDistance = Memory.ArmyGroup.totalDistance;
        self.maxDistance = Memory.ArmyGroup.maxDistance;
        self.soilderCount = Memory.ArmyGroup.soilderCount;
        self.state = Memory.ArmyGroup.state;
        Memory.ArmyGroup.GUID = self.GUID;
        const pos = Memory.ArmyGroup.pos;
        self.pos = new RoomPosition(pos.x, pos.y, pos.roomName);
        // self.pos = new RoomPosition(27, 25, 'W13N14');
        let minDistance = Vector2.MapDistanceTo(self.pos, self.migratePoints[0]);
        self.selectIndex = 0;
        for (let index = 0; index < self.migratePoints.length; index++) {
            const migratePoint = self.migratePoints[index];
            const distance = Vector2.MapDistanceTo(self.pos, migratePoint);
            if (distance < minDistance) {
                self.selectIndex = index;
                minDistance = distance;
            }
        }
        self.pos = self.migratePoints[self.selectIndex];
    },

    LateUpdate_Attribute: Config.Public,
    LateUpdate: function(self) {
        self.state = Memory.ArmyGroup.state
        if (self.state === Config.Army.None) {
            return;
        }
        if (self.maxDistance < 5 && self.selectIndex < self.migratePoints.length - 1) {
            self.pos = self.migratePoints[++self.selectIndex];
            Memory.ArmyGroup.pos = self.pos;
        }

        Memory.ArmyGroup.totalDistance = self.totalDistance;
        self.totalDistance = 0;
        Memory.ArmyGroup.maxDistance = self.maxDistance;
        self.maxDistance = 0;
        Memory.ArmyGroup.soilderCount = self.soilderCount;
        self.soilderCount = 0;
        if (Game.time % 10 === 4) {
            console.log(`ArmyGroup pos : ${JSON.stringify(self.pos)}, find : ${Memory.ArmyGroup.find}`);
        }
    },

    Reset_Attribute: Config.Public | Config.Static,
    Reset: function() {
        const armyGroup = MonoBehaviour.GetById(Memory.ArmyGroup.GUID);
        armyGroup.pos = Config.Army.migratePoints[0];
        Memory.ArmyGroup.pos = Config.Army.migratePoints[0];
        armyGroup.state = Config.Army.None;
        Memory.ArmyGroup.state = Config.Army.None;
    },

    RunSoilder_Attribute: Config.Public,
    RunSoilder: function(self, soilder) {
        const creep = Game.getObjectById(soilder.id);
        if (self.state !== Config.Army.Attack) {
            OOP.Goto(soilder, 0);
        }
        soilder.pos = self.pos;
        const pos = creep.pos;
        const distance = Vector2.MapDistanceTo(pos, self.pos);
        if (self.maxDistance < distance) {
            self.maxDistance = distance;
        }
        if (self.state === Config.Army.Attack) {
            OOP.Attack(soilder, Memory.ArmyGroup.find);
        }
    },
}
module.exports = ArmyGroup;