const Gatter = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "Gatter",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const obj = Game.getObjectById(data.id);
        const resource = Game.getObjectById(data.resourceId);
        if (!resource) {
            throw Exception.New("ArgumentException", "Gatter can't get energy").value;
        }
        self.resourceId = data.resourceId;
        if (!data.pos) {
            throw Exception.New("ArgumentException", "Gatter can't data.pos").value;
        }
        self.pos = data.pos;
        self.bodyData = CreepComponent.ParseCreepBody(obj);
    },

    Update_Attribute: Config.Public,
    Update: function(self) {
        const creep = Game.getObjectById(self.id);
        const distance = Vector2.MapDistanceTo(self.pos, creep.pos);
        let result;
        if (distance > 0) {
            result = creep.moveTo(self.pos.x, self.pos.y, { visualizePathStyle: { stroke: '#dddddd' } });
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
            return;
        }

        const containerList = creep.pos.findInRange(FIND_STRUCTURES, 0);
        let container = undefined;
        let constructionSite = undefined;
        if (containerList.length === 0) {
            constructionSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0);
            if (!constructionSite) {
                Game.rooms[self.pos.roomName].createConstructionSite(self.pos.x, self.pos.y, STRUCTURE_CONTAINER);
                return;
            }
        } else {
            container = containerList[0];
        }

        if (constructionSite) {
            result = creep.build(constructionSite);
            if (result === OK) {
                Statistics.APICost += 0.2;
            }
            return;
        }

        const resource = Game.getObjectById(self.resourceId);
        const creepFreeCapacity = creep.store.getFreeCapacity();
        if (resource.energy <= 0) {
            // resource energy 正在重置，自己月光了
        } else if (container && container.store.getFreeCapacity() > 0 || creepFreeCapacity > 0) {
            result = creep.harvest(resource);
        } else if (container && (container.hitsMax - container.hits) > 1000 && creepFreeCapacity < 50) {
            result = creep.repair(container);
        }
        if (result === OK) {
            Statistics.APICost += 0.2;
        }
    },
};

module.exports = Gatter;