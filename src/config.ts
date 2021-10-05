import { BodyMapping } from 'utils'
import { TDstType } from 'global'

export const SpawnName = 'BaseSpawn'

export const BaseBody: BodyMapping = {
  work: 1,
  move: 1,
  carry: 1
}

if (Memory.init === undefined) {
  console.log('init memory')
  Memory.init = true
  Memory.uuid = 1
  Memory.dstCounter = {
    source: {},
    spawn: {},
    container: {}
  } as TDstType
}
