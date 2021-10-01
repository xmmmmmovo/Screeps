const TransferMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "TransferMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {
        if (!data.roomName) {
            throw Exception.New("ArgumentException.", "TransferMission need roomName").value;
        }
        self.roomName = data.roomName;
    },

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        const creepPos = creep.pos;
        if (creepPos.roomName !== self.roomName) {
            return -1;
        }
        const energy = creep.store[RESOURCE_ENERGY];
        const freeCapacity = creep.store.getFreeCapacity();
        if (energy / freeCapacity < 0.2 || energy < 35) {
            return -1;
        }
        let value = Game.time - self.startTime;
        value += energy;
        return value;
    },

    Do_Attribute: Config.Public,
    Do: function(self, creep) {
        if (!self.id) {
            TransferMission.RedirectTransferTarget(self, creep);
            // 区块性任务完成
            if (!self.id) {
                self.state = 10;
                return;
            }
        }

        const obj = Game.getObjectById(self.id);
        if (!obj || self.state > 10) {
            OOP.CreepCancel(self);
            return;
        }
        if (obj.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
            self.id = undefined;
            TransferMission.RedirectTransferTarget(self, creep);
            if (self.id === undefined) {
                self.state = 10;
                return;
            }
        }
        const distance = Vector2.MapDistanceTo(obj.pos, creep.pos);
        if (distance > 1) {
            OOP.CreepMoveByPath(self, creep, obj.pos);
        }
        const energy = creep.store[RESOURCE_ENERGY];
        if (energy === 0) {
            self.state = 10;
            return;
        }
        if (distance <= 1) {
            const result = creep.transfer(obj, RESOURCE_ENERGY);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
            // 传输完能量，防止 creep 愣一下
            self.id = undefined;
            self.path = undefined;
        }
    },
    RedirectTransferTarget_Attribute: Config.Private,
    RedirectTransferTarget: function(self, creep) {
        const mapCache = MapCache.TryGetMapCache(undefined, self.roomName);
        OOP.RefreshRoomStructureData(mapCache, undefined);
        let minDistance = 10000;
        for (const extensionId of mapCache.ExtensionId) {
            const extension = Game.getObjectById(extensionId);
            if (!extension || extension.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                continue;
            }
            const distance = Vector2.DistanceTo(creep.pos, extension.pos);
            if (distance < minDistance) {
                self.id = extensionId;
                minDistance = distance;
            }
        }
    },
}

module.exports = TransferMission;