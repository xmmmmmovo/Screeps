import { roleHarvester } from "roles/role.harvester";
import { ErrorMapper } from "utils/ErrorMapper";
import { FSpawn, Role } from "type";
import { addByRole, getCreepAmounr, getSpawnRole, removeByRole } from "dispatch/dispatch.role";
import { roleUpgrader } from "roles/role.upgrader";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      removeByRole(Memory.creeps[name].role as Role, name);
      delete Memory.creeps[name];
      console.log(`delete memory: ${name}`);
    }
  }

  // const creeps_amount = Object.keys(Game.creeps);

  // 自动调节生成
  if (Game.spawns[FSpawn].spawning === null && getCreepAmounr() < 2) {
    const name = "creeps" + Game.time;
    const role = getSpawnRole();
    // const mem: CreepMemory = {
    //   role: role as string,
    //   room: "",
    //   working: true
    // };

    // console.log(`generate new creep: ${name}, role: ${role}`);
    // const ret = Game.spawns[FSpawn].spawnCreep([WORK, CARRY, MOVE], name, {
    //   memory: mem
    // });

    // if (ret === OK) {
    //   addByRole(role, name, mem);
    // }
  }

  Object.entries(Game.creeps).forEach(([key, creep]) => {
    if (creep.memory.role === (Role.harvester as string)) {
      roleHarvester.run(creep);
    } else if (creep.memory.role === (Role.upgrader as string)) {
      roleUpgrader.run(creep);
    }
  });
});
