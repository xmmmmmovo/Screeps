import { build } from "./actions/build";
import { harvest } from "./actions/harvest";

export const builder = {
  run: function (creep: Creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {
      build(creep);
    } else {
      harvest(creep);
    }
  }
};
