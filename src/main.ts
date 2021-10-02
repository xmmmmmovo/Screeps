import { exportStats, ErrorMapper } from 'utils'
// 导入第三方
import '3rd_party'

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
})
