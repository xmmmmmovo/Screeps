// 导入第三方
import '3rd_party'
import { SpawnName } from 'core/constant'
import { getSpawn } from 'creeps/spawn'
import { exportStats } from 'core/utils/record'
import { strategyList } from 'dispatch/strategy'
import { ErrorMapper } from 'core/utils/ErrorMapper'

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // export now status for grafana
  exportStats()

  const controller = getSpawn(SpawnName).room.controller
  if (controller === undefined) {
    return
  }

  const l = [1, 2, 3]
  _.any(l, v => {
    console.log(v)
    if (v < 2) return true
    return false
  })

  _.any(strategyList, s => {
    if (s.levelUpperBound > controller.level) {
      console.log('aaa')
      s.run()
      return false
    }
    return true
  })
})
