let tools = require('taskTools')

let taskSpawnCreep = {
  taskKind: 'taskSpawnCreep',

  taskSubmit(o, requirement, rooms, details) {
    tools.mainTaskIssue(o, this.taskKind, rooms, details)
  },

  taskGet() {
    Global_taskSpawnCreep_tmpMaxNumber = -100
    let result = tools.getTaskByKind(this.taskKind)
    result.filter(this.priorityFilter)
    if (result.length > 0) {
      return result[result.length - 1]
    } else {
      return ''
    }
  },

  priorityFilter(hash) {
    if (Memory.task[hash].details.priority == undefined) {
      Memory.task[hash].details.priority = 0
    }
    if (Global_taskSpawnCreep_tmpMaxNumber < Memory.task[hash].details.priority) {
      Global_taskSpawnCreep_tmpMaxNumber = Memory.task[hash].details.priority
      return true
    } else return false
    return false
  }
}

module.exports = taskSpawnCreep
