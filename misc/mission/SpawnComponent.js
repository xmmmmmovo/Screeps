const SpawnComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "SpawnComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        if (!data.roomName) {
            throw Exception.New("ArgumentException", "Not found roomName").value;
        }
        self.roomName = data.roomName;
        self.objType = "Spawn";
        self.nextCreep = undefined; // 预定的 creep 信息, 同一时间只能预定一个
    },

    Update_Attribute: Config.Public,
    Update: function(self) {
        const spawn = Game.getObjectById(self.id);
        if (spawn.spawning) {
            lastSpawnTime = Game.time + 50;
            spawn.room.visual.text(
                '🛠️',
                spawn.pos.x,
                spawn.pos.y, { align: 'right', opacity: 0.8 });
            return;
        }
        let spawnResult;
        if (self.nextCreep) {
            spawnResult = spawn.spawnCreep(self.nextCreep.body, Game.time.toString(), self.nextCreep.options);
            self.nextCreep = undefined;
        }
    },

    NeedCreep_Attribute: Config.Public,
    NeedCreep: function(self, body, options) {
        const spawn = Game.getObjectById(self.id);
        if (!spawn.spawning) {
            self.nextCreep = {
                body: body,
                options: options
            };
            return true;
        } else {
            return false;
        }
    },
};

module.exports = SpawnComponent;