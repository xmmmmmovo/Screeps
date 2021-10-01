import { roleHarvester } from 'roles/harvester'
import { FSpawn, Role } from 'types'
import { roleUpgrader } from 'roles/upgrader'
import { roleBuilder } from 'roles/builder'
import { exportStats, ErrorMapper } from 'utils'
// 导入第三方
import '3rd_party'

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  exportStats()

  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name]
      console.log(`delete memory: ${name}`)
    }
  }

  console.log(Game.time)
  // const creeps_amount = Object.keys(Game.creeps);

  // 自动调节生成
  // if (Game.spawns[FSpawn].spawning === null && getCreepAmount() <= config.minCreepNum) {
  //   const role = getSpawnRole();
  //   const name = role + Game.time;
  //   const mem: CreepMemory = {
  //     role: role as string,
  //     room: "",
  //     target: "",
  //     working: true
  //   };

  //   if (
  //     Game.spawns[FSpawn].spawnCreep([WORK, CARRY, MOVE], name, {
  //       dryRun: true
  //     }) === OK
  //   ) {
  //     console.log(`generate new creep: ${name}, role: ${role}`);
  //     const ret = Game.spawns[FSpawn].spawnCreep([WORK, CARRY, MOVE], name, {
  //       memory: mem,
  //       directions: [BOTTOM, BOTTOM]
  //     });

  //     if (ret === OK) {
  //       updateCreep();
  //     }
  //   }
  // }

  // Object.entries(Game.creeps).forEach(([key, creep]) => {
  //   if (creep.memory.role === (Role.harvester as string)) {
  //     roleHarvester.run(creep);
  //   } else if (creep.memory.role === (Role.upgrader as string)) {
  //     roleUpgrader.run(creep);
  //   } else if (creep.memory.role === (Role.builder as string)) {
  //     roleBuilder.run(creep);
  //   }
  // });
})
