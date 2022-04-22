interface IMissionSystem {
  registerMission(missionName: string, runner: () => void): boolean
}

class MissionSystemImpl implements IMissionSystem {
  private mission: Record<string, () => void> = {}

  registerMission(missionName: string, runner: () => void): boolean {
    throw new Error('Function not implemented.')
  }
}

export const MissionSystem = new MissionSystemImpl()
