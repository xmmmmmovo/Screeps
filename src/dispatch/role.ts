import { Role } from "type";

let creepGroupBy = _.groupBy(Memory.creeps, "role");

export const getSpawnRole = function (): Role {
  return Role.upgrader;
};

export const updateCreep = function () {};

export const getCreepAmounr = function (): number {
  return 0;
};
