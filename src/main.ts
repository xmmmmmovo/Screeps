// 导入第三方
import '3rd_party'
import { SpawnName } from 'constant'
import { getSpawn } from 'creeps/spawn'
import { ErrorMapper } from 'core/utils/error_mapper'
import { cleanDeadCreepsMemory } from 'core/memory'
import { strategyList } from 'strategy/strategy'

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // cleanup dead creep's memory
  cleanDeadCreepsMemory()

  const controller = getSpawn(SpawnName).room.controller
  if (controller === undefined) {
    return
  }

  _.any(strategyList, strategy => {
    if (strategy.levelUpperBound <= controller.level) {
      console.log(`use ${strategy.levelUpperBound} strategy`)
      strategy.inLoop()
      return false
    }
    return true
  })
})
