const LinkComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "LinkComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        const linkObj = Game.getObjectById(data.id);
        self.id = linkObj.id;
        self.roomName = linkObj.pos.roomName;
        self.objType = "Link";
        self.linkType = 'balance';
        self.structureId = undefined;
        self.operatingMission = undefined;
    },

    OnEnable_Attribute: Config.Public,
    OnEnable: function(self) {
        const obj = Game.getObjectById(self.id);
        const structureList = obj.pos.findInRange(FIND_STRUCTURES, 1);
        for (const structure of structureList) {
            switch (structure.structureType) {
                case STRUCTURE_CONTAINER:
                    self.structureId = structure.id;
                    self.linkType = 'in';
                    break;
                case STRUCTURE_CONTROLLER:
                    self.structureId = structure.id;
                    self.linkType = 'out';
                    break;
                case STRUCTURE_STORAGE:
                    self.structureId = structure.id;
                    self.linkType = 'balance';
                    break;
                default:
                    break;
            }
        }
    },
    OnDisable: function(self) {
        if (self.operatingMission) {
            OOP.CreepCancel(self.mission);
            self.operatingMission = undefined;
        }
    },
    Update_Attribute: Config.Public,
    Update: function(self) {
        const linkObj = Game.getObjectById(self.id);
        const structureObj = Game.getObjectById(self.structureId);
        if (!linkObj || !structureObj) {
            OOP.SetActive(self, false);
            return;
        }
        switch (self.linkType) {
            case 'in':
                LinkComponent.RefreshIn(self);
                break;
            case 'out':
            case 'balance':
            default:
                break;
        }
    },
    RefreshIn_Attribute: Config.Private,
    RefreshIn: function(self) {
        if (Game.time % 5 !== 4) {
            return;
        }
        const linkObj = Game.getObjectById(self.id);
        const structureObj = Game.getObjectById(self.structureId);
        const freeCapacity = linkObj.store.getFreeCapacity(RESOURCE_ENERGY);
        if (!Mission.IsRunning(self.operatingMission) &&
            freeCapacity > 0 &&
            structureObj.store[RESOURCE_ENERGY] > 500) {
            const operatingMission = OperatingMission.New({
                missionType: Config.Mission.Operating,
                pos: linkObj.pos,
                startTime: Game.time,
                weight: 30,
                arriveCallback: (creep) => LinkComponent.TransferEnergy(self, creep),
            });
            Mission.AddLast(operatingMission);
            self.operatingMission = operatingMission.GUID;
        }

        if (linkObj.cooldown > 0) {
            return;
        } else if (freeCapacity <= 0) {
            const mapCache = MapCache.TryGetMapCache(undefined, self.roomName);
            // console.log(JSON.stringify(mapCache.LinksId));
            for (const linkId of mapCache.LinksId) {
                const anotherLinkComp = MonoBehaviour.GetComponent(linkId, LinkComponent);
                if (!anotherLinkComp || !anotherLinkComp.activeSelf) {
                    continue;
                }
                const anotherObj = Game.getObjectById(linkId);
                // console.log(anotherLinkComp.linkType, anotherObj.store.getFreeCapacity(RESOURCE_ENERGY));
                if (anotherLinkComp.linkType === 'out' && anotherObj.store.getFreeCapacity(RESOURCE_ENERGY) >= 770) {
                    linkObj.transferEnergy(anotherObj);
                }
            }
        }
    },
    TransferEnergy: function(self, creep) {
        const linkObj = Game.getObjectById(self.id);
        const structureObj = Game.getObjectById(self.structureId);
        if (structureObj.store[RESOURCE_ENERGY] < 100 || linkObj.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
            return 10;
        } else if (creep.store[RESOURCE_ENERGY] > 0) {
            if (Vector2.DistanceToObj(creep.pos, linkObj) > 1) {
                const result = creep.moveTo(linkObj);
                if (result === OK) {
                    Statistics.APICost += 0.2;
                }
                return 1;
            } else {
                creep.transfer(linkObj, RESOURCE_ENERGY);
                return 1;
            }
        } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (Vector2.DistanceToObj(creep.pos, structureObj) > 1) {
                const result = creep.moveTo(structureObj);
                if (result === OK) {
                    Statistics.APICost += 0.2;
                }
                return 1;
            } else {
                creep.withdraw(structureObj, RESOURCE_ENERGY);
                return 1;
            }
        }
    },
}

module.exports = LinkComponent;