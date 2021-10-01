const TowerComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "TowerComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const obj = Game.getObjectById(data.id);
        self.objType = "Tower";
        self.transferMissions = [];
        self.roomName = obj.pos.roomName;
    },

    Update_Attribute: Config.Public,
    Update: function(self) {
        const tower = Game.getObjectById(self.id);
        TowerComponent.OpenFire(self, tower);
        TowerComponent.TransferMissions(self, tower);
    },

    OpenFire_Attribute: Config.Private,
    OpenFire: function(self, tower) {
        const roomMemory = Memory.RoomComponent[self.roomName];
        if (!roomMemory) {
            console.log("Warning! not found roomMemory : " + self.roomName)
            return;
        }
        const hostileCreeps = roomMemory.hostileCreeps;
        let obj;
        for (const hostileCreepId of hostileCreeps) {
            obj = Game.getObjectById(hostileCreepId);
            if (obj && obj.hits) {
                break;
            }
        }
        let result;
        if (obj) {
            result = tower.attack(obj);
            const component = MonoBehaviour.GetById(roomMemory.GUID);
            OOP.PlusAlert(component);
        }
        if (result === OK) {
            Statistics.APICost += 0.2;
        }
    },
    TransferMissions_Attribute: Config.Private,
    TransferMissions: function(self, tower) {
        if (Game.time % 5 != 1) {
            return;
        }
        const energy = tower.store[RESOURCE_ENERGY];
        self.transferMissions = Mission.HoldIfRunning(self.transferMissions);
        if (energy + self.transferMissions.length * 300 < 1000) {
            const transferMission = TransferMission.New({
                missionType: Config.Mission.Transfer,
                id: self.id,
                pos: tower.pos,
                startTime: Game.time,
                roomName: self.roomName,
                weight: 200,
            });
            Mission.AddLast(transferMission);
            self.transferMissions.push(transferMission.GUID);
        }
    }
};

module.exports = TowerComponent;