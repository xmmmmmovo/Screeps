const Map = {
    // 当前具有 Spawn 的房间，请确保具有视野
    OwnRoom: ['W17N15', 'W17N16'],
    // 当前没有占有的过路房间，也可能是盟军的区域
    PassingRoom: [],
    RoomComponents: [{
        roomName: 'W17N15',
        virtual: true,
        pos: { x: 13, y: 40, roomName: 'W17N15' }, // MoveToMission 目标点
        targetHits: 1800000,
        maxBuildMission: 2,
        resourceRatio: 3,
        alertLimit: 1500, // 警戒值上限，当超过此值是启用安全协议
        gatterConfig: [{
                resourceId: '5bbcabee9099fc012e63486f',
                pos: { x: 18, y: 30, roomName: 'W17N15' },
                creepId: undefined, // creepId runtime set
            },
            {
                resourceId: '5bbcabee9099fc012e63486e',
                pos: { x: 13, y: 29, roomName: 'W17N15' },
                creepId: undefined, // creepId runtime set
            }
        ],
        gatter: {
            creepCount: 2,
            spawnId: '61017538b30303de113348cc', // spawn id,
            body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        },
        exigence: {
            creepCount: 2,
            spawnId: '61017538b30303de113348cc', // spawn id,
            body: [WORK, CARRY, CARRY, MOVE, MOVE],
        },
        worker: {
            creepCount: 5,
            spawnId: '61017538b30303de113348cc', // spawn id,
            body: [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        },
    }, {
        roomName: 'W17N16',
        virtual: true,
        pos: { x: 21, y: 25, roomName: 'W17N15' }, // MoveToMission 目标点
        targetHits: 1000,
        maxBuildMission: 2,
        resourceRatio: 1,
        alertLimit: 20,
        gatterConfig: [{
                resourceId: '5bbcabed9099fc012e63486b',
                pos: { x: 25, y: 23, roomName: 'W17N16' },
                creepId: undefined, // creepId runtime set
            },
            {
                resourceId: '5bbcabed9099fc012e63486a',
                pos: { x: 7, y: 5, roomName: 'W17N16' },
                creepId: undefined, // creepId runtime set
            }
        ],
        // gatter: {
        //     creepCount: 2,
        //     spawnId: '610edafe8e04c85509080684', // spawn id,
        //     body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        // },
        // exigence: {
        //     creepCount: 2,
        //     spawnId: '610edafe8e04c85509080684', // spawn id,
        //     body: [WORK, CARRY, CARRY, MOVE, MOVE],
        // },
        worker: {
            creepCount: 3,
            spawnId: '610edafe8e04c85509080684', // spawn id,
            body: [WORK, CARRY, MOVE, CARRY, MOVE],
        },
    }],
    ControllerComponents: [{
        roomName: 'W17N15',
        virtual: true,
        upgrade: true,
        missionCount: 3,
        upgradeMissionWeight: [-10, 0],
    }, {
        roomName: 'W17N16',
        virtual: true,
        upgrade: true,
        missionCount: 2,
        upgradeMissionWeight: [-20, 0],
    }, ],
};

module.exports = Map;