import { harvesters, upgraders } from "global";
import { Role } from "type";

export const getSpawnRole = function (): Role {
  if (harvesters.size < 1) return Role.harvester;
  if (upgraders.size < 1) return Role.upgrader;
  return Role.harvester;
};

const getRoleMap = function (role: Role): Map<string, CreepMemory> | null {
  if (role === Role.harvester) return harvesters;
  if (role === Role.upgrader) return upgraders;
  return null;
};

export const removeByRole = function (role: Role, name: string): boolean {
  const map = getRoleMap(role);
  if (map === null || !map.has(name)) {
    return false;
  }
  return map.delete(name);
};

export const addByRole = function (role: Role, name: string, val: CreepMemory): boolean {
  const map = getRoleMap(role);
  console.log("map" + JSON.stringify(map));
  if (map === null || map.has(name)) {
    return false;
  }
  map.set(name, val);
  return true;
};

export const getCreepAmounr = function (): number {
  return harvesters.size + upgraders.size;
};
