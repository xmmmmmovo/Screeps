import { roleHarvester } from "roles/role.harvester";
import { ErrorMapper } from "utils/ErrorMapper";
import { FSpawn, Harvester } from "type";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log(`delete memory: ${name}`);
    }
  }
  const creeps_amount = Object.keys(Game.creeps);
  // if (Game.spawns[FSpawn].spawning !== null && creeps_amount.length < 2) {
  //   const name = "creeps" + Game.time;
  //   console.log(`generate new creep: ${name}`);
  //   Game.spawns[FSpawn].spawnCreep([WORK, CARRY, MOVE], name, { memory: { role: Harvester } });
  // }

  Object.entries(Game.creeps).forEach(([key, creep]) => {
    if (creep.memory.role === Harvester) {
      roleHarvester.run(creep);
    }
  });
});
