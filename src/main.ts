// 导入第三方
import '3rd_party'
import { Role } from 'global'
import { roleHarvester } from 'logic/roles/harvester'

import { exportStats, ErrorMapper, spawnDispatch, reduceDstCounter } from 'utils'

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  exportStats()

  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      reduceDstCounter(Memory.creeps[name])
      delete Memory.creeps[name]
      console.log(`delete memory: ${name}`)
    }
  }

  spawnDispatch()

  _.forEach(Game.creeps, creep => {
    switch (creep.memory.role) {
      case Role.HAVESTER:
        roleHarvester.run(creep)
        break
      case Role.UPGRADER:
        break
      case Role.BUILDER:
        break
      default:
        console.log('unknown role! please debug your code!')
    }
  })
})
