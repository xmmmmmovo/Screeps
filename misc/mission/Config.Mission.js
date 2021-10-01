const Mission = {
    ScanRatio: 0.1, // 每帧扫描的任务数量
    Build: {
        objType: "Creep",
        missionType: "Build",
        bodyData: {
            carry: 1,
            move: 1,
            work: 1,
        },
    },
    Claim: {
        objType: "Creep",
        missionType: "Claim",
        bodyData: {
            claim: 1,
            move: 1,
        },
    },
    Gatter: {
        objType: "Creep",
        missionType: "Gatter",
        bodyData: {
            carry: 1,
            move: 1,
        },
    },
    MoveTo: {
        objType: "Creep",
        missionType: "MoveTo",
        bodyData: {
            move: 1,
        },
    },
    Operating: {
        objType: "Creep",
        missionType: "Operating",
        bodyData: {
            carry: 1,
            move: 1,
        },
    },
    Repaire: {
        objType: "Creep",
        missionType: "Repaire",
        bodyData: {
            carry: 1,
            move: 1,
            work: 1,
        },
    },
    Transfer: {
        objType: "Creep",
        missionType: "Transfer",
        bodyData: {
            carry: 1,
            move: 1,
        },
    },
    UpgradeController: {
        objType: "Creep",
        missionType: "UpgradeController",
        bodyData: {
            carry: 1,
            move: 1,
            work: 1,
        },
    },
};

module.exports = Mission;