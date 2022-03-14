// 导入第三方
import '3rd_party'
import { SpawnName } from 'core/constant'
import { getSpawn } from 'core/creeps/spawn'
import { exportStats } from 'core/record'
import { strategyList } from 'strategy'
import { ErrorMapper } from 'utils/ErrorMapper'

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  exportStats()
  const controller = getSpawn(SpawnName).room.controller
  if (controller === undefined) {
    return
  }
  _.any(strategyList, s => {
    if (s.levelUpperBound > controller.level) {
      s.run()
      return false
    }
    return true
  })
})
