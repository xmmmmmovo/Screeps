export type BodyMapping = Readonly<{
  [key in BodyPartConstant]?: number
}>

export function bodyGenerator(bodies: BodyMapping | BodyMapping[]): BodyPartConstant[] {
  return _.isArray(bodies)
    ? _.reduce(
        bodies,
        (result: BodyPartConstant[], value: BodyMapping) => {
          result.push(...bodyGenerator(value))
          return result
        },
        Array<BodyPartConstant>()
      )
    : _.reduce(
        bodies,
        (result: BodyPartConstant[], value: number, key: BodyPartConstant) => {
          result.push(...Array(value).fill(key))
          return result
        },
        Array<BodyPartConstant>()
      )
}
