export type BodyMapping = Readonly<
  {
    [key in BodyPartConstant]?: number
  }
>

export function bodyGenerator(body: BodyMapping): BodyPartConstant[] {
  return _.reduce(
    body,
    (result: BodyPartConstant[], value: number, key: BodyPartConstant) => {
      result.push(...Array(value).fill(key))
      return result
    },
    Array<BodyPartConstant>()
  )
}

export function bodyGeneratorFromList(bodies: BodyMapping[]): BodyPartConstant[] {
  return _.reduce(
    bodies,
    (result: BodyPartConstant[], value: BodyMapping) => {
      result.push(...bodyGenerator(value))
      return result
    },
    Array<BodyPartConstant>()
  )
}
