export interface ITaskSystem {
  createTask(): void
}

export enum TaskType {
  DELIVER,
  WORK
}

export enum TaskStatus {
  DOING,
  FINISH,
  FAIL,
  ASKGIVEUP
}

export interface Task {
  name: string
  weight: number
  type: TaskType
  status: TaskStatus
}

class TaskSystemImpl implements ITaskSystem {
  createTask(): void {
    throw new Error('Method not implemented.')
  }
}

export const TaskSystem = new TaskSystemImpl()
