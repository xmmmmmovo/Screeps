import { Role } from "types";

let creepGroupBy = _.groupBy(Memory.creeps, "role");

export const getSpawnRole = function (): Role {
  if (creepGroupBy[Role.harvester] === undefined || creepGroupBy[Role.harvester].length < 1) return Role.harvester;
  if (creepGroupBy[Role.upgrader] === undefined || creepGroupBy[Role.upgrader].length < 1) return Role.upgrader;
  if (creepGroupBy[Role.builder] === undefined || creepGroupBy[Role.builder].length < 1) return Role.builder;
  return Role.upgrader;
};

// 以内存为基础进行统计，不需要走Game
export const updateCreep = function () {
  creepGroupBy = _.groupBy(Memory.creeps, "role");
};

export const getCreepAmounr = function (): number {
  return Object.keys(Memory.creeps).length;
};
