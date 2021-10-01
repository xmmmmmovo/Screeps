var OnceCode = undefined;
OnceCode = {
    _Attribute: Config.Public,
    base: "MonoBehaviour",
    typeName: "OnceCode",
    staticCtor: function(data) {},

    Run_Attribute: Config.Public,
    Update: function(self) {},
    Run_Attribute: Config.Public,
    Run: function() {
        // console.log("`<script src=\"https://screeps-cn.gitee.io/screeps-chinese-pack-release/main.js\" async defer></script>`");
        // const claimMission = ClaimMission.New({
        //     missionType: Config.Mission.Claim,
        //     id: '5bbcabed9099fc012e63486c',
        //     pos: new RoomPosition(9, 35, 'W17N16'),
        //     startTime: Game.time,
        //     weight: 0,
        // });
        // Mission.AddFirst(claimMission);
        // for (const buildId of[
        //         '610ea9094812694a4f2b8f52',
        //     ]) {
        //     const build = Game.getObjectById(buildId);
        //     if (!build) {
        //         continue;
        //     }
        //     const mission = BuildMission.New({
        //         missionType: Config.Mission.Build,
        //         id: build.id,
        //         pos: build.pos,
        //         startTime: Game.time,
        //         weight: 300,
        //     });
        //     Mission.AddFirst(mission);
        // }

        // for (const repaireId of[
        //         '61053e77fca1973da951f589',
        //     ]) {
        //     const build = Game.getObjectById(repaireId);
        //     if (!build) {
        //         continue;
        //     }
        //     const repaireMission = RepaireMission.New({
        //         missionType: Config.Mission.Repaire,
        //         id: build.id,
        //         pos: build.pos,
        //         startTime: Game.time,
        //         hitsMax: 10000000,
        //         weight: 100000,
        //     });
        //     Mission.AddLast(repaireMission);
        // }
    },
}

module.exports = OnceCode;