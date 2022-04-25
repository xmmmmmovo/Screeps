export function cleanDeadCreepsMemory(): void {
  _.each(Memory.creeps, (v, k: string | undefined) => {
    if (!Game.creeps[k as string]) {
      delete Memory.creeps[k as string]
    }
  })
}
