const ControllerComponent = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "ControllerComponent",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        self.roomName = data.roomName;
        self.upgrade = data.upgrade ? data.upgrade : false; // 启用升级任务
        self.upgradeMissions = [];
        self.stopDownprogressMission = undefined;
        if (data.missionCount && data.missionCount >= 0) {
            self.missionCount = data.missionCount;
        } else {
            self.missionCount = 1;
        }
        self.upgradeMissionWeight = data.upgradeMissionWeight; // 升级任务系数
    },

    Update_Attribute: Config.Public,
    Update: function(self) {
        const room = Game.rooms[self.roomName];
        const obj = room ? room.controller : undefined;
        // 沒有视野
        if (!room || !obj) {
            return;
        }
        if (obj.downprogress < 5000 && !Mission.IsRunning(self.stopDownprogressMission)) {
            const upgradeMission = UpgradeMission.New({
                missionType: Config.Mission.UpgradeController,
                id: obj.id,
                pos: obj.pos,
                startTime: Game.time,
                weight: 300,
            });
            Mission.AddFirst(upgradeMission);
            self.stopDownprogressMission = upgradeMission.GUID;
        }
        if (!self.upgrade) {
            return;
        }
        self.upgradeMissions = Mission.HoldIfRunning(self.upgradeMissions);
        const needCount = self.missionCount - self.upgradeMissions.length;
        if (needCount > 0) {
            for (let index = 0; index < needCount; index++) {
                const upgradeMission = UpgradeMission.New({
                    missionType: Config.Mission.UpgradeController,
                    id: obj.id,
                    pos: obj.pos,
                    startTime: Game.time,
                    weight: self.upgradeMissions.length * self.upgradeMissionWeight[0] + self.upgradeMissionWeight[1],
                });
                Mission.AddLast(upgradeMission);
                self.upgradeMissions.push(upgradeMission.GUID);
            }
        }
    },
};

module.exports = ControllerComponent;