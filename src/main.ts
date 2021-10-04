// 导入第三方
import '3rd_party'
import { BaseBody, Role, SpawnName, Status } from 'global'

import { exportStats, ErrorMapper, bodyGenerator, getSpawn, spawnCreep, spawnTask } from 'utils'

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

  const counter = _.countBy(Memory.creeps, 'role')

  spawnTask(counter, Role.HAVESTER, Status.IDLE, SpawnName, BaseBody)
  spawnTask(counter, Role.BUILDER, Status.IDLE, SpawnName, BaseBody)
  spawnTask(counter, Role.UPGRADER, Status.IDLE, SpawnName, BaseBody)

  _.forEach(Game.creeps, creep => {
    switch (creep.memory.role) {
      case Role.HAVESTER:
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
