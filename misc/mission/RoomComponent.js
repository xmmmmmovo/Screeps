if (Memory.RoomComponent === undefined) {
    Memory.RoomComponent = {};
}
const RoomComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "RoomComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const room = Game.rooms[data.roomName];
        self.roomName = room.name;
        self.buildMissions = []; // 建筑任务，mission GUID,
        self.maxBuildMission = data.maxBuildMission ? data.maxBuildMission : 2;
        self.gatterMissions = []; // 采集任务，mission GUID,
        self.transferMissions = []; // 传输任务, mission GUID,
        self.transferStorageMissions = []; // 传输到仓库的任务
        self.moveToMission = undefined; // 提供视野任务，GUID/undefined
        self.lastRepaireTime = Game.time + 5;
        self.repaireMission = {};
        let roomMemory = Memory.RoomComponent[self.roomName];
        if (roomMemory === undefined) {
            roomMemory = Memory.RoomComponent[self.roomName] = {};
        }
        roomMemory.lastSeeTime = roomMemory.lastSeeTime ? roomMemory.lastSeeTime : (Game.rooms[self.roomName] ? Game.time : 0);
        roomMemory.hostileCreeps = roomMemory.hostileCreeps ? roomMemory.hostileCreeps : [];
        self.lastFindHostileTime = Game.time - Math.floor(Math.random() * 5);
        roomMemory.GUID = self.GUID;
        roomMemory.alertTime = roomMemory.alertTime ? roomMemory.alertTime : 0; // 紧急状态程度
        self.pos = Vector2.New(data.pos);
        self.targetHits = data.targetHits ? data.targetHits : 10000;
        self.gatterConfig = data.gatterConfig ? data.gatterConfig : [];
        self.gatter = data.gatter ? data.gatter : { creepCount: 0 };
        self.exigence = data.exigence ? data.exigence : { creepCount: 0 };
        self.worker = data.worker ? data.worker : { creepCount: 0 };
        self.alertLimit = data.alertLimit ? data.alertLimit : 1000;
        self.random = Math.floor(Math.random() * 10);
        self.resourceRatio = data.resourceRatio ? data.resourceRatio : 1;
    },

    OnEnable_Attribute: Config.Public,
    OnEnable: function(self) {
        const room = Game.rooms[self.roomName];
        RoomComponent.CreateMission(self, room);
        RoomComponent.FindHostile(self, room);
    },
    Update_Attribute: Config.Public,
    Update: function(self) {
        const room = Game.rooms[self.roomName];
        RoomComponent.CreateMission(self, room);
        RoomComponent.FindHostile(self, room);
        RoomComponent.RefreshAlert(self, room);
        RoomComponent.RefreshGatter(self, room);
    },
    CreateMission_Attribute: Config.Private,
    CreateMission: function(self, room) {
        let roomMemory = Memory.RoomComponent[self.roomName];
        if (!room) {
            if (roomMemory.lastSeeTime + 500 < Game.time &&
                !Mission.IsRunning(self.moveToMission)) {
                const moveToMission = MoveToMission.New({
                    missionType: Config.Mission.MoveTo,
                    startTime: roomMemory.lastSeeTime,
                    pos: self.pos,
                });
                Mission.AddLast(moveToMission);
                self.moveToMission = moveToMission.GUID;
            }
            return;
        }
        roomMemory.lastSeeTime = Game.time;
        self.buildMissions = Mission.HoldIfRunning(self.buildMissions);
        if (self.buildMissions.length < self.maxBuildMission) {
            const sites = room.find(FIND_CONSTRUCTION_SITES);
            for (let index = 0; index < sites.length && self.buildMissions.length < self.maxBuildMission; index++) {
                const build = sites[index];
                const weight = sites.length > 4 ? 4 : sites.length;
                const buildMission = BuildMission.New({
                    missionType: Config.Mission.Build,
                    id: build.id,
                    pos: build.pos,
                    startTime: Game.time,
                    weight: weight * 10 - self.buildMissions.length * 30,
                });
                Mission.AddLast(buildMission);
                self.buildMissions.push(buildMission.GUID);
            }
        }
        self.gatterMissions = Mission.HoldIfRunning(self.gatterMissions);
        const mapCache = MapCache.TryGetMapCache(undefined, room);
        OOP.RefreshRoomStructureData(mapCache, undefined);
        if (self.gatterMissions.length < mapCache.ResourceId.length * self.resourceRatio) {
            for (let index = 0; index < mapCache.ResourceId.length; index++) {
                const resourceId = mapCache.ResourceId[index];
                const resource = Game.getObjectById(resourceId);
                if (resource && resource.energy > 0) {
                    const gatterMission = GatterMission.New({
                        missionType: Config.Mission.Gatter,
                        id: resourceId,
                        pos: resource.pos,
                        startTime: Game.time,
                        weight: 40 - self.gatterMissions.length * 20,
                    });
                    Mission.AddLast(gatterMission);
                    self.gatterMissions.push(gatterMission.GUID);
                }
            }
        }
        if (self.lastRepaireTime < Game.time) {
            let repairCount = 0;
            for (const id of Object.keys(self.repaireMission)) {
                const GUID = self.repaireMission[id];
                if (!Mission.IsRunning(GUID)) {
                    delete self.repaireMission[id];
                } else {
                    repairCount++;
                }
            }
            self.lastRepaireTime = Game.time + 50;
            OOP.RefreshRoomStructureData(mapCache);
            PushMission:
                for (const id in mapCache.StructurePos) {
                    const pos = mapCache.StructurePos[id];
                    if (repairCount > 3) {
                        break PushMission;
                    }
                    const item = Game.getObjectById(id);
                    if (!item) {
                        continue;
                    } else if (!item.hits || !item.hitsMax || self.repaireMission[id]) {
                        continue;
                    } else if ((self.targetHits - item.hits >= 3000 && item.hitsMax - item.hits >= 3000) || ( // 维修阈值 3000 
                            item.hits < 10000 && item.hits / item.hitsMax < 0.7)) {
                        const repaireMission = RepaireMission.New({
                            missionType: Config.Mission.Repaire,
                            id: id,
                            pos: pos,
                            startTime: Game.time,
                            hitsMax: self.targetHits,
                            weight: (1 - item.hits / item.hitsMax) * 50,
                        });
                        Mission.AddLast(repaireMission);
                        self.repaireMission[id] = repaireMission.GUID;
                        repairCount++;
                    }
                }
        }
        self.transferMissions = Mission.HoldIfRunning(self.transferMissions);
        self.transferStorageMissions = Mission.HoldIfRunning(self.transferStorageMissions);
        const needEnergy = room.energyCapacityAvailable - room.energyAvailable - self.transferMissions.length * 150 - 250;
        if (needEnergy > 0 && self.transferMissions.length < 3) {
            const transferMission = TransferMission.New({
                missionType: Config.Mission.Transfer,
                id: false,
                pos: false,
                startTime: Game.time,
                roomName: self.roomName,
                weight: needEnergy * 0.25 + 30,
            });
            Mission.AddLast(transferMission);
            self.transferMissions.push(transferMission.GUID);
        } else if (room.energyAvailable / room.energyCapacityAvailable > 0.75 && self.transferStorageMissions.length < 1) {
            const storage = Game.getObjectById(mapCache.StorageId);
            if (storage && storage.store.getFreeCapacity() > 10000) {
                for (const containerId of mapCache.ContainerId) {
                    const container = Game.getObjectById(containerId);
                    if (container.store[RESOURCE_ENERGY] < 1700) {
                        continue;
                    }
                    const transferMission = TransferMission.New({
                        missionType: Config.Mission.Transfer,
                        id: mapCache.StorageId,
                        pos: storage.pos,
                        startTime: Game.time,
                        roomName: self.roomName,
                        weight: 0,
                    });
                    Mission.AddLast(transferMission);
                    self.transferStorageMissions.push(transferMission.GUID);
                }
            }
        }
    },
    FindHostile_Attribute: Config.Private,
    FindHostile(self, room) {
        const roomMemory = Memory.RoomComponent[self.roomName];
        if (!room) {
            roomMemory.hostileCreeps = [];
            roomMemory.alertTime = 0;
            return;
        } else if (self.lastFindHostileTime > Game.time) {
            return;
        } else {
            roomMemory.hostileCreeps = [];
        }
        self.lastFindHostileTime += 5;
        for (const hostileCreep of room.find(FIND_HOSTILE_CREEPS)) {
            roomMemory.hostileCreeps.push(hostileCreep.id);
        }
    },
    RefreshAlert_Attribute: Config.Private,
    RefreshAlert: function(self, room) {
        const roomMemory = Memory.RoomComponent[self.roomName];
        for (const hostileCreepId of roomMemory.hostileCreeps) {
            const hostileCreep = Game.getObjectById(hostileCreepId);
            if (!hostileCreep || !hostileCreep.body.length) {
                continue;
            }
            const length = hostileCreep.body.length;
            roomMemory.alertTime += length * length / 25;
        }
        if (roomMemory.alertTime > self.alertLimit && !room.controller.safeMode) {
            room.controller.activateSafeMode();
        } else if (roomMemory.alertTime > 0) {
            roomMemory.alertTime--;
        }
    },
    PlusAlert_Attribute: Config.Public,
    PlusAlert: function(self) {
        const roomMemory = Memory.RoomComponent[self.roomName];
        roomMemory.alertTime++;
    },
    RefreshGatter_Attribute: Config.Private,
    RefreshGatter: function(self, room) {
        if (Game.time % 20 !== self.random) {
            return;
        }
        const mapCache = MapCache.TryGetMapCache(undefined, self.roomName);
        let gatterCount = 0;
        let workerCount = 0;
        for (const creepId of mapCache.Creeps) {
            for (const component of MonoBehaviour.GetAllComponents(creepId)) {
                const componentType = OOP.GetType(component);
                if (Class.IsAssignableFrom(componentType, CreepComponent)) {
                    workerCount++;
                } else if (Class.IsAssignableFrom(componentType, Gatter)) {
                    gatterCount++;
                }
            }
        }
        let spawnId = undefined;
        let needBody = undefined;
        if (self.gatter.creepCount > gatterCount) {
            spawnId = self.gatter.spawnId;
            needBody = self.gatter.body;
        } else if (self.worker.creepCount > workerCount) {
            spawnId = self.worker.spawnId;
            needBody = self.worker.body;
        }
        // console.log(`spawnId: ${spawnId}, workerCount : ${workerCount}, gatterCount : ${gatterCount}, ${JSON.stringify(needBody)}`);
        if (!spawnId || !needBody) {
            return;
        }
        const spawnComponent = MonoBehaviour.GetComponent(spawnId, SpawnComponent);
        if (!spawnComponent) {
            console.log(`Can't find spawn at ${self.roomName}, spawnId : ${spawnId}`);
        } else {
            OOP.NeedCreep(spawnComponent, needBody);
        }
    },
    AddOneGatter_Attribute: Config.Public,
    AddOneGatter: function(self, creep) {
        if (self.gatterConfig.length < 1) {
            return false;
        }
        let seletGatterConfig = undefined;
        let minDistance = 10000;
        for (let index = 0; index < self.gatterConfig.length; index++) {
            const gatterConfig = self.gatterConfig[index];
            if (gatterConfig.creepId) {
                if (!Game.getObjectById(gatterConfig.creepId)) {
                    gatterConfig.creepId = undefined;
                }
            }
            if (gatterConfig.creepId) {
                continue;
            }
            const distance = Vector2.DistanceTo(creep.pos, gatterConfig.pos);
            if (minDistance > distance) {
                seletGatterConfig = gatterConfig;
                minDistance = distance;
            }
        }
        if (seletGatterConfig) {
            const component = Gatter.New({
                id: creep.id,
                resourceId: seletGatterConfig.resourceId,
                pos: seletGatterConfig.pos,
            });
            OOP.SetActive(component, true);
            seletGatterConfig.creepId = creep.id;
            return true;
        }
        return false;
    },
};

module.exports = RoomComponent;