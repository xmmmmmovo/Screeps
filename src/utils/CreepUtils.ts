export function reduceDstCounter(creepMem: CreepMemory): void {
  _.forEach(creepMem.dset, (value, key: Id<Structure | Source | Resource> | any): void => {
    Memory.dstCounter[value.type][value.rname][key as Id<Structure | Source | Resource>]--
  })
}
