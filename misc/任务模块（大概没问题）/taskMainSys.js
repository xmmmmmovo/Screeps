let tools = require('taskTools')

let taskMainSys = {
  TASK_LIST: [require('task.spawnCreep')],

  init() {
    if (!Memory.task) {
      Memory.task = {}
    }
    if (!Memory.taskFinder_kind) {
      Memory.taskFinder_kind = {}
    }
    for (let i in this.TASK_LIST) {
      if (!Memory.taskFinder_kind[this.TASK_LIST[i].taskKind]) {
        Memory.taskFinder_kind[this.TASK_LIST[i].taskKind] = []
      }
    }
  },

  cycle() {
    // 数t一次，清理不活跃的任务
    this.init()
    if (Game.time % 100 == 0) {
      for (let mainHash in Memory.task) {
        let subTaskNum = 0

        for (let subHash in Memory.task[mainHash].subTask) {
          // 子任务清理
          let op = 0
          if (Game.time > Memory.task[mainHash].subTask[subHash].activeTime + 50) {
            op = 1
          }
          if (Memory.task[mainHash].subTask[subHash].done == tools.SUB_TASK_STATE.FINISH) {
            op = 2
          }
          if (Memory.task[mainHash].subTask[subHash].done == tools.SUB_TASK_STATE.FAIL) {
            op = 3
          }
          switch (op) {
            case 1:
              tools.subTaskFail(mainHash, subHash)
              break
            case 2:
              tools.subTaskFinish(mainHash, subHash)
              break
            case 3:
              tools.subTaskFail(mainHash, subHash)
              break
            case 0:
              subTaskNum++
              break
          }
        }
        if (subTaskNum == 0 && Memory.task[mainHash].requirement == 0) {
          tools.mainTaskFinish(mainHash)
        }
      }
    }
  }
}

module.exports = taskMainSys
