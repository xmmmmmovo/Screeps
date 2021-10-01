global.MapCacheSet = {};

// 生成，维护地图数据缓存和地图上的路径
const MapCache = {
    _Attribute: Config.Public,
    base: undefined,
    typeName: "MapCache",
    typeIndex: undefined,
    staticCtor: function(data) {},

    // 生成配置表中列出房间的数据缓存
    GreateAllMapCache_Attribute: Config.Public | Config.Static,
    GreateAllMapCache: function() {
        const allRooms = {};
        for (const name of Config.Map.OwnRoom) {
            allRooms[name] = 1;
        }
        for (const name of Config.Map.PassingRoom) {
            allRooms[name] = 2;
        }
        for (const name of Config.Map.OwnRoom) {
            const mapCache = MapCacheSet[name] = MapCache.New(name);
            const room = Game.rooms[name];
            OOP.RefreshPositonData(mapCache, room);
            OOP.RefreshRoomStructureData(mapCache, room);

            for (const anotherName in allRooms) {
                if (name != anotherName) {
                    mapCache.Exit[anotherName] = room.findExitTo(anotherName);
                }
            }
        }
    },
    TryGetMapCache_Attribute: Config.Public | Config.Static,
    TryGetMapCache: function(mapCache, room) {
        if (room === undefined) {
            room = Game.rooms[mapCache.name];
        } else if (typeof(room) === "string") {
            room = Game.rooms[room];
        }
        if (mapCache === undefined) {
            mapCache = MapCacheSet[room.name]
        }
        if (mapCache) { // 已有缓存
            return mapCache;
        }
        // 创建地图缓存
        mapCache = MapCacheSet[room.name] = MapCache.New(room);
        OOP.RefreshPositonData(mapCache, room);
        return mapCache;
    },

    // string room: 房间名称, 'E4N7' | Screeps.room room: 房间实例
    __init: function(self, room) {
        let name;
        if (typeof(room) === "string") {
            name = room;
        } else {
            name = room.name;
        }
        self.name = name;
        self.lastRefreshTime = 0;
        self.StructurePos = {};
        // 建筑位置
        self.ResourceId = [];
        self.SpawnsId = [];
        self.ContainerId = [];
        self.ExtensionId = [];
        self.TowersId = [];
        self.LinksId = [];
        self.TerminalId = undefined;
        self.StorageId = undefined;
        self.ControllerId = undefined;
        self.Exit = {};
        self.Creeps = []; // 房间内的所有己方 creep
        self.lastFrame = 0; // 上次更新资源预定的时间
    },
    FindPositionDict: {
        FIND_EXIT_TOP: 'TopExit',
        FIND_EXIT_RIGHT: 'RightExit',
        FIND_EXIT_BOTTOM: 'BottomExit',
        FIND_EXIT_LEFT: 'LeftExit',
    },
    // 使用 room 实例的数据设置 MapCache 基础点位信息，没有读取设脏标记
    // string room: 房间名称, 'E4N7' | Screeps.room room: 为空时自行尝试获取，需要使用有效实例的数据
    RefreshPositonData_Attribute: Config.Public,
    RefreshPositonData: function(self, room) {
        if (room === undefined) {
            room = Game.rooms[self.name];
        } else if (typeof(room) === "string") {
            room = Game.rooms[room];
        }
        if (!room) {
            throw Exception.New("ArgumentException", "Not found room, name : " + self.name).value;
        } else if (self.name !== room.name) {
            throw Exception.New("ArgumentException", "Room is not match, name : " + self.name + " room.name: " + room.name).value;
        }

        for (const findItem in this.FindPositionDict) {
            const posCache = self[findItem] = [];
            for (const roomPosition of room.find(findItem)) {
                posCache.push(Vector2.New(roomPosition));
            }
        }
    },
    // 使用 room 实例的数据设置 Structure 信息，刷新前需要设脏，否则阻止刷新
    // string room: 房间名称, 'E4N7' | Screeps.room room 为空时自行尝试获取，需要使用有效实例的数据
    RefreshRoomStructureData_Attribute: Config.Public,
    RefreshRoomStructureData: function(self, room) {
        if (self.lastRefreshTime > Game.time) {
            return;
        }
        self.lastRefreshTime = Game.time + 3000;
        if (room === undefined) {
            room = Game.rooms[self.name];
        } else if (typeof(room) === "string") {
            room = Game.rooms[room];
        }
        if (!room) {
            throw Exception.New("ArgumentException", "Not found room, name : " + self.name).value;
        }

        self.ResourceId.length = 0;
        for (const obj of room.find(FIND_SOURCES)) {
            self.ResourceId.push(obj.id);
        }
        self.SpawnsId.length = 0;
        for (const obj of room.find(FIND_MY_SPAWNS)) {
            self.SpawnsId.push(obj.id);
        }
        self.ContainerId.length = 0;
        self.ExtensionId.length = 0;
        self.TowersId.length = 0;
        self.LinksId.length = 0;
        self.TerminalId = undefined;
        self.StructurePos = {};
        for (const structure of room.find(FIND_STRUCTURES)) {
            let components;
            if (!structure.isActive()) {
                continue;
            }
            switch (structure.structureType) {
                case STRUCTURE_TOWER:
                    components = Memory.Components[structure.id];
                    if (!components) {
                        components = Memory.Components[structure.id] = [];
                    }
                    if (structure.my) {
                        self.TowersId.push(structure.id);
                        if (components.length === 0) {
                            const component = TowerComponent.New({ id: structure.id });
                            OOP.SetActive(component, true);
                        }
                    }
                    break;
                case STRUCTURE_TERMINAL:
                    if (structure.my) {
                        self.TerminalId = structure.id;
                    }
                    components = Memory.Components[structure.id];
                    if (!components) {
                        components = Memory.Components[structure.id] = [];
                    }
                    break;
                case STRUCTURE_EXTENSION:
                    if (structure.my) {
                        self.ExtensionId.push(structure.id);
                    }
                    break;
                case STRUCTURE_CONTAINER:
                    self.ContainerId.push(structure.id);
                    break;
                case STRUCTURE_STORAGE:
                    components = Memory.Components[structure.id];
                    if (!components) {
                        components = Memory.Components[structure.id] = [];
                    }
                    if (structure.my) {
                        self.StorageId = structure.id;
                    }
                    break;
                case STRUCTURE_LINK:
                    components = Memory.Components[structure.id];
                    if (!components) {
                        components = Memory.Components[structure.id] = [];
                    }
                    self.LinksId.push(structure.id);
                    if (components.length === 0) {
                        const component = LinkComponent.New({ id: structure.id });
                        OOP.SetActive(component, true);
                    }
                default:
                    break;
            }
            self.StructurePos[structure.id] = structure.pos;
        }
        if (room.controller) {
            self.ControllerId = room.controller.id;
        }
    },
    SetStructure_Attribute: Config.Private,
    SetStructure: function(self, structure) {
        console.log("MapCache NotImpException.");
    },
    SetDirty_Attribute: Config.Public,
    SetDirty: function(self) {
        self.lastRefreshTime = 0;
    },
}

module.exports = MapCache;