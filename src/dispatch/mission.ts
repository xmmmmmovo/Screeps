import { logger } from 'core/logger'

interface IMissionSystem {
  registerMission(missionName: string, runner: () => void): boolean
}

class MissionSystemImpl implements IMissionSystem {
  private missionMap = new Map<string, () => void>()

  registerMission(missionName: string, runner: () => void): boolean {
    if (this.missionMap.has(missionName)) return false
    this.missionMap.set(missionName, runner)
    return true
  }

  excute(): void {
    _.forEach(this.missionMap, (fn: () => void, key: string | undefined) => {
      logger.info(`${key as string} mission is runnning`)
      fn()
    })
  }
}

export const MissionSystem = new MissionSystemImpl()
