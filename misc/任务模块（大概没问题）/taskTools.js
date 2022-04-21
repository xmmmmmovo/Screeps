let taskTools = {
  SUB_TASK_STATE: {
    DOING: 0,
    FINISH: 1,
    FAIL: 2,
    ASKGIVEUP: 3
  },

  mainTaskIssue(clientId, taskKind, rooms, requirement, details) {
    let task = {
      client: clientId,
      taskKind,
      rooms,
      requirement,
      details,
      subTask: {}
    }

    let hash = this.taskGlobalHashAdd() + '_' + Game.time
    Memory.taskFinder_kind[taskKind].push(hash)
    Memory.task[hash] = task
    return hash
  },

  subTaskIssue(mainHash, applyRequirement) {
    let factRequirement
    if (Memory.task[mainHash].requirement > 0) {
      factRequirement = Math.min(Memory.task[mainHash].requirement, applyRequirement)
      Memory.task[mainHash].requirement = Memory.task[mainHash].requirement - factRequirement
    } else {
      return ''
    }

    let subTask = {
      activeTime: Game.time,
      done: this.SUB_TASK_STATE.DOING,
      applyRequirement: factRequirement
    }

    let subHash = this.taskGlobalHashAdd() + '_' + Game.time
    Memory.task[mainHash].subTask[subHash] = subTask
    return subHash
  },

  getTaskByKind(taskKind) {
    // var ret = {};
    return Memory.taskFinder_kind[taskKind].filter(this.reqIsnt0)
  },

  subTaskFail(mainHash, subHash) {
    Memory.task[mainHash].requirement =
      Memory.task[mainHash].requirement + Memory.task[mainHash].subTask[subHash].applyRequirement
    delete Memory.task[mainHash].subTask[subHash]
  },

  subTaskFinish(mainHash, subHash) {
    delete Memory.task[mainHash].subTask[subHash]
  },

  subTaskRefresh(mainHash, subHash) {
    Memory.task[mainHash].subTask[subHash].activeTime = Game.time
  },

  mainTaskFinish(mainHash) {
    _.remove(Memory.taskFinder_kind[Memory.task[mainHash].taskKind], e => {
      return e == mainHash
    })
    delete Memory.task[mainHash]
  },

  taskGlobalHashAdd() {
    if (typeof Global_taskTools_taskHash == 'undefined') {
      Global_taskTools_taskHash = 1
    } else {
      Global_taskTools_taskHash++
    }
    return Global_taskTools_taskHash
  },

  reqIsnt0(hash) {
    return Memory.task[hash].requirement != 0
  }
}

module.exports = taskTools
