import { assert } from 'chai'

describe('loadsh', () => {
  before(() => {
    // runs before all test in this block
  })

  beforeEach(() => {
    return
  })

  it('object countBy', () => {
    const obj = {
      a: { role: 'a' },
      b: { role: 'a' },
      c: { role: 'b' },
      d: { role: 'a' }
    }

    const counter = _.countBy(obj, 'role')
    assert.deepEqual(counter, { a: 3, b: 1 })
  })
})
