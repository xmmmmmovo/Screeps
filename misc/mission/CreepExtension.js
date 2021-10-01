const CreepExtension = {
    _Attribute: Config.Public,
    base: undefined,
    typeName: "CreepExtension",
    typeIndex: undefined,
    staticCtor: function(data) {},

    CreepMoveByPath_Attribute: Config.Public | Config.Static,
    CreepMoveByPath: function(instance, creep, targetPos){
        const pos = creep.pos;
        if (instance.path === undefined ||
            (creep.fatigue <= 0 &&
                instance.recordPos.x === pos.x && instance.recordPos.y === pos.y ||
                instance.recordPos.roomName !== pos.roomName)) { // 卡墙里了
            instance.path = pos.findPathTo(targetPos ? targetPos : instance.pos);
        }
        if (creep.fatigue <= 0) {
            instance.recordPos = { x: pos.x, y: pos.y, roomName: pos.roomName };
            const result = creep.moveByPath(instance.path);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
        }
    },
}

module.exports = CreepExtension;