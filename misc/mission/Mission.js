var Missions = {}; // 所有任务的容器
var MissionCount = 0;

const Mission = {
    _Attribute: Config.Public,
    base: undefined,
    typeName: "Mission",
    typeIndex: undefined,
    staticCtor: function(data) {},

    Instance: undefined, // 单例
    __init(self, data) {
        if (data.missionType === undefined) {
            throw Exception.New("ArgumentException", "missionType is undefined : " + missionType).value;
        }
        self.missionType = data.missionType;
        self.startTime = data.startTime ? data.startTime : Game.time; // 任务创建时间
        self.pos = data.pos ? data.pos : false // 可能存在的路经点，或者为 false
        self.value = 0; // 留存最后一次出价，用于数据分析
        self.GUID = GUID++;
        self.id = data.id ? data.id : false;
        self.state = 0; // 任务标记，0 无人接管，1 正在执行，10 执行完成，20 任务取消，21 任务错误取消
        self.weight = data.weight ? data.weight : 0; // 任务基础权重
        self.path = undefined;
        self.recordPos = undefined;
        self.recordPos = { x: -1, y: -1 };
    },

    GetValue_Attribute: Config.Public | Config.Abstract,
    GetValue: function(self, creep, instance) {},
    Do_Attribute: Config.Public | Config.Abstract,
    Do: function(self, creep) {},

    CreepCancel_Attribute: Config.Public,
    CreepCancel: function(self) {
        self.state = 21;
        self.recordPos = { x: -1, y: -1, roomName: undefined };
    },
    CreepMoveByPath_Attribute: Config.Public,
    CreepMoveByPath(self, creep, targetPos) {
        CreepExtension.CreepMoveByPath(self, creep, targetPos);
    },

    AddFirst_Attribute: Config.Public | Config.Static,
    AddFirst: function(mission) {
        if (mission.state !== 0) {
            throw Exception.New("ArgumentException", "get new mission and add it.").value;
        }
        Missions[mission.GUID] = mission;
        MissionCount++;
    },
    AddLast_Attribute: Config.Public | Config.Static,
    AddLast: function(mission) {
        if (mission.state !== 0) {
            throw Exception.New("ArgumentException", "get new mission and add it.").value;
        }
        Missions[mission.GUID] = mission;
        MissionCount++;
    },
    Remove_Attribute: Config.Public | Config.Static,
    Remove: function(mission, GUID) {
        GUID = GUID ? GUID : mission.GUID;
        if (!GUID) {
            throw Exception.New("ArgumentException").value;
        }
        Missions[GUID].state = 20;
    },

    Update_Attribute: Config.Public | Config.Static,
    Update: function() {
        if (Game.time % 30 !== 0) {
            return;
        }
        const lastMissions = Missions;
        Missions = {};
        const MissionCountBefore = MissionCount;
        MissionCount = 0;
        for (const GUID in lastMissions) {
            const mission = lastMissions[GUID];
            if (mission.state >= 10) {
                continue;
            } else {
                Missions[GUID] = mission;
                MissionCount++;
            }
        }
        console.log("MissionCount : " + MissionCountBefore + " => " + MissionCount);
    },

    GetOneMission_Attribute: Config.Public | Config.Static,
    GetOneMission: function(obj, instance) {
        let selectMission = undefined;
        let value = 0;
        NextMisson:
            for (const GUID in Missions) {
                const mission = Missions[GUID];
                if (mission.state !== 0 || mission.missionType.objType !== instance.objType) {
                    continue NextMisson;
                }
                const missionBodyData = mission.missionType.bodyData;
                for (const bodyPart in missionBodyData) {
                    if (instance.bodyData[bodyPart] < missionBodyData[bodyPart]) {
                        continue NextMisson;
                    }
                }
                const missionValue = OOP.GetValue(mission, obj, instance);
                if (missionValue > mission.value) {
                    mission.value = missionValue;
                }
                if (missionValue > value) {
                    selectMission = mission;
                    value = missionValue;
                }
            }
        if (selectMission !== undefined) {
            selectMission.state = 1;
        }
        return selectMission;
    },

    m_Array: [],
    HoldIfRunning_Attribute: Config.Public | Config.Static,
    HoldIfRunning: function(missionArray) {
        let temp = Mission.m_Array;
        temp.length = 0;
        Mission.m_Array = missionArray;
        missionArray = temp;
        for (const GUID of Mission.m_Array) {
            const mission = Missions[GUID];
            if (mission && mission.state < 10) {
                missionArray.push(GUID);
            }
        }
        return missionArray;
    },
    // 查询指向任务是否仍在运行或等待运行
    IsRunning_Attribute: Config.Public | Config.Static,
    IsRunning(GUID) {
        if (GUID) {
            const mission = Missions[GUID];
            if (mission && mission.state < 10) {
                return true;
            }
        }
        return false;
    },

    ToString_Attribute: Config.Public | Config.Static,
    ToString: function() {
        console.log(JSON.stringify(Missions));
    },
    // 将当前任务日志转换为 CSV 日志
    ToCSV_Attribute: Config.Public | Config.Static,
    ToCSV: function() {
        const stringBuilder = [];
        stringBuilder.push("GUID\tmissionType\tstate\tpos\tweight\tstartTime\tvalue");
        for (const GUID in Missions) {
            const mission = Missions[GUID];
            const posContent = mission.pos ? `${mission.pos.x},${mission.pos.y},${mission.pos.roomName}` : "null";
            const line = `${mission.GUID}\t${mission.missionType.missionType}\t${mission.state}\t${posContent}\t${mission.weight}\t${mission.startTime}\t${mission.value}`;
            stringBuilder.push(line);
        }
        return stringBuilder.join('\n');
    },
}

module.exports = Mission;