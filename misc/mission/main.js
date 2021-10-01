global.GUID = 0;
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

const exportsRef = module.exports;
const FirstFrame = function() {
    exportsRef.loop = Loop;

    global.Config = require('./Config');
    global.Class = require('./Class');

    Class.staticCtor({
        TypeList: Config.TypeList,
    });
    MapCache.GreateAllMapCache();
    Statistics.Update();
    Mission.Update();
    for (const ctorParameters of Config.Map.RoomComponents) {
        const component = RoomComponent.New(ctorParameters);
        OOP.SetActive(component, true);
    }
    for (const ctorParameters of Config.Map.ControllerComponents) {
        const component = ControllerComponent.New(ctorParameters);
        OOP.SetActive(component, true);
    }
    const armyGroup = ArmyGroup.New({
        virtual: true
    });
    OOP.SetActive(armyGroup, true);

    // spawn 初始化
    const spawnsList = Object.keys(Game.spawns);
    for (const spawnName of spawnsList) {
        const spawn = Game.spawns[spawnName];
        Memory.Components[spawn.id] = [];
        const component = SpawnComponent.New({
            id: spawn.id,
            roomName: spawn.pos.roomName
        });
        OOP.SetActive(component, true);
    }
    for (const id in Memory.spawns) {
        const spawn = Game.spawns[id];
        if (!spawn) {
            delete Memory.spawns[id];
        }
    }
    for (const id in Memory.creeps) {
        Memory.creeps[id].components = undefined;
    }
    OnceCode.Run();
}
const Loop = function() {
    Statistics.Update();
    Mission.Update();
    for (const roomName in MapCacheSet) {
        const mapCache = MapCacheSet[roomName]
        mapCache.Creeps.length = 0;
    }
    // creep 初始化
    for (const id in Memory.creeps) {
        const creep = Game.creeps[id];
        if (!creep) { // 死亡
            delete Memory.creeps[id];
            continue;
        } else if (!creep.id) { // 还没完全 spawn，没有 id
            continue;
        }
        const mapCache = MapCache.TryGetMapCache(undefined, creep.pos.roomName);
        mapCache.Creeps.push(creep.id);
        let components = Memory.Components[creep.id];
        if (components === undefined) {
            components = Memory.Components[creep.id] = [];
        }
        if (components.length === 0) {
            const bodyData = CreepComponent.ParseCreepBody(creep);
            let consume = false;
            // 如果此 creep 出生地房间能添加 Gatter，则添加
            // 此处逻辑需要修改，因为不能添加应当算作异常
            if (!consume && bodyData.work > 3 && bodyData.move / bodyData.size < 0.26) {
                const roomComponentGUID = Memory.RoomComponent[creep.pos.roomName].GUID;
                const roomComponent = MonoBehaviour.GetById(roomComponentGUID);
                consume = RoomComponent.AddOneGatter(roomComponent, creep);
            }
            if (consume) {
                continue;
            }
            let component;
            if (bodyData.attack > 0 || bodyData.tough > 0) {
                component = Soilder.New({
                    id: creep.id,
                    pos: Config.Army.pos
                });
                global.oneSoilder = component;
            } else if (bodyData.work > 0 || bodyData.claim > 0) {
                component = CreepComponent.New({ id: creep.id });
            }
            if (component) {
                OOP.SetActive(component, true);
            } else {
                console.log("component can't add creep.id : " + creep.id);
            }
        }
    }
    MonoBehaviour.RunBehaivours(null);
    Statistics.EndOfFrame();
}

exportsRef.loop = FirstFrame;