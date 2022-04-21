export interface ITaskSystem {
  createTask(): void
}

export const TaskSystem: ITaskSystem = {
  createTask(): void {
    throw new Error('Function not implemented.')
  }
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
