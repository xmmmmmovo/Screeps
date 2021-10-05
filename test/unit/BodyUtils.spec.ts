import { bodyGenerator } from '../../src/utils/BodyUtils'

it('生成body', () => {
  const res = bodyGenerator({ move: 1 })
  expect(res).toBe([[MOVE]])
})
