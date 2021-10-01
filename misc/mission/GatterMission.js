const GatterMission = {
    _Attribute: Config.Public,
    base: "Mission",
    typeName: "GatterMission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init(self, data) {
        const mapCache = MapCache.TryGetMapCache(undefined, self.pos.roomName);
        OOP.RefreshRoomStructureData(mapCache, undefined);
        if (data.containerId) {
            self.containerId = data.containerId;
        } else {
            self.containerId = undefined;
            let minDistance = 10000;
            for (const containerId of mapCache.ContainerId) {
                const container = Game.getObjectById(containerId);
                if (!container) {
                    continue;
                }
                const distance = Vector2.DistanceTo(container.pos, self.pos);
                const energy = container.store[RESOURCE_ENERGY];
                if (energy > 1000 && minDistance > distance / 2) {
                    self.containerId = containerId;
                    self.tryWithDraw = true;
                    minDistance = distance / 2;
                } else if (energy > 50 && minDistance > distance) {
                    self.containerId = containerId;
                    self.tryWithDraw = true;
                    minDistance = distance;
                }
            }
        }
    },

    GetValue_Attribute: Config.Public,
    GetValue: function(self, creep, instance) {
        if (creep.body.contains(ATTACK)) {
            return -1;
        }
        const freeCapacity = creep.store.getFreeCapacity();
        if (freeCapacity === 0) {
            return -1;
        }
        const creepPos = creep.pos;
        if (creepPos.roomName !== self.pos.roomName) {
            return -1;
        }
        let value = Game.time - self.startTime - Vector2.MapDistanceTo(self.pos, creepPos) + freeCapacity * 0.3;
        value += freeCapacity;
        return value;
    },

    Do_Attribute: Config.Public,
    Do: function(self, creep) { // 函数即将重写
        const obj = Game.getObjectById(self.id);
        if (!obj || self.state > 10) {
            OOP.CreepCancel(self);
            return;
        }

        const freeCapacity = creep.store.getFreeCapacity();
        if (freeCapacity === 0) {
            self.state = 10;
            return;
        }
        if (self.tryWithDraw && GatterMission.TryWithDraw(self, creep)) {
            return;
        } else if (obj.energy === 0) { // 能量源没有能量了
            OOP.CreepCancel(self);
            return;
        } else {
            GatterMission.TryHarvest(self, creep);
        }
    },
    TryWithDraw_Attribute: Config.Public,
    TryWithDraw: function(self, creep) {
        const container = Game.getObjectById(self.containerId);
        if (!container) {
            self.tryWithDraw = false;
            self.path = undefined;
            return false;
        }
        const distance = Vector2.MapDistanceTo(container.pos, creep.pos);
        const containsEnergy = container.store[RESOURCE_ENERGY];
        if (distance > 1 && containsEnergy > 10) {
            OOP.CreepMoveByPath(self, creep, container.pos);
            return true;
        }
        if (containsEnergy <= 10) {
            self.tryWithDraw = false;
            self.path = undefined;
            return false;
        } else {
            const result = creep.withdraw(container, RESOURCE_ENERGY);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
            self.tryWithDraw = false;
            if (containsEnergy > creep.store.getFreeCapacity()) {
                self.state = 10;
            }
        }
        return true;
    },
    TryHarvest_Attribute: Config.Public,
    TryHarvest: function(self, creep) {
        const obj = Game.getObjectById(self.id);
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        if (distance > 1) {
            OOP.CreepMoveByPath(self, creep);
        } else {
            const result = creep.harvest(obj);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
        }
    },
}

module.exports = GatterMission;