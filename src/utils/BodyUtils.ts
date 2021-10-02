const regExp = /([mwcarhit])([0-9]+)/g
const mulRegExp = /([*])([0-9]+)/g
const checkRegExp = /^([mwcarhit*][0-9]+)*$/

const bodyMapping: Record<string, BodyPartConstant> = {
  m: MOVE,
  w: WORK,
  c: CARRY,
  a: ATTACK,
  r: RANGED_ATTACK,
  h: HEAL,
  i: CLAIM,
  t: TOUGH
}

/**
 * 展平creepBody
 *
 * @static
 * @param {string} body
 * @returns {string}
 * @memberof bodyTools
 */
function flatten(body: string): string {
  if (!body) {
    console.log(body)
    throw Error('body不存在!')
  }
  // 切割
  const mulSplitResult = body.split(mulRegExp)
  if (mulSplitResult.length > 1) {
    const mulResult = []
    for (let index = 0; index < mulSplitResult.length; index += 3) {
      const element = mulSplitResult[index]
      const mulCount = Number(mulSplitResult[index + 2])
      if (mulCount) {
        for (let index0 = 0; index0 < mulCount; index0++) {
          mulResult.push(element)
        }
      } else {
        mulResult.push(element)
      }
    }
    return mulResult.join('')
  } else {
    return body
  }
}

/**
 * 身体部件生成器。示例：
 *
 * * m5 = [ 'move', 'move', 'move', 'move', 'move' ]
 * * m2c2 = [ 'move', 'move', 'carry', 'carry' ]
 * * m1a1*4 =[
 * 'move', 'attack',
 * 'move', 'attack',
 * 'move', 'attack',
 * 'move', 'attack'
 *  ]
 * * m3r1h1t1*2 =[
 * 'move', 'move',
 * 'move', 'ranged_attack',
 * 'heal', 'tough',
 * 'move', 'move',
 * 'move', 'ranged_attack',
 * 'heal', 'tough'
 *  ]
 * *("\*"是"*")
 * * m1w2\*3m2w1\*2i3=[
 * 'move',  'work',  'work',
 * 'move',  'work',  'work',
 * 'move',  'work',  'work',
 * 'move',  'move',  'work',
 * 'move',  'move',  'work',
 * 'claim', 'claim', 'claim'
 *  ]
 *
 *
 * @param {string} body
 * @returns {BodyPartConstant[]}
 */
export function compile(body: string): BodyPartConstant[] {
  const bodyResult: BodyPartConstant[] = []
  const mulResultStr = flatten(body)
  const splitResult = mulResultStr.split(regExp)
  // console.log(splitResult);
  for (let index = 0; index < splitResult.length; index += 3) {
    const bodyShortName = splitResult[index + 1]
    const count = Number(splitResult[index + 2])
    for (let index2 = 0; index2 < count; index2++) {
      bodyResult.push(bodyMapping[bodyShortName])
    }
  }
  return bodyResult
}

/**
 * 获得body的组件数量
 *
 * @static
 * @param {string} body
 * @param {BodyPartConstant[]} [bodypartNameList]
 * @returns {number}
 * @memberof bodyTools
 */
function getNum(body: string, bodypartNameList: BodyPartConstant[]): number {
  const flattenBody = flatten(body)
  const compiledElementList = flattenBody.split(regExp)
  let cost = 0
  if (bodypartNameList) {
    for (let index0 = 0; index0 < compiledElementList.length; index0 += 3) {
      if (bodypartNameList.findIndex(val => bodyMapping[compiledElementList[index0 + 1]] === val) !== -1) {
        const num = Number(compiledElementList[index0 + 2])
        if (num) {
          cost += num
        }
      }
    }
  } else {
    for (let index0 = 0; index0 < compiledElementList.length; index0 += 3) {
      const num = Number(compiledElementList[index0 + 2])
      if (num) {
        cost += num
      }
    }
  }
  // console.log(compiledElementList, cost);
  return cost
}

/**
 * 获得body的能量消耗
 *
 * @static
 * @param {string} body
 * @returns {number}
 * @memberof bodyTools
 */
function getEnergyCost(body: string): number {
  const flattenBody = flatten(body)
  const compiledElementList = flattenBody.split(regExp)
  let cost = 0
  for (let index0 = 0; index0 < compiledElementList.length; index0 += 3) {
    const num = Number(compiledElementList[index0 + 2])
    if (num) {
      cost +=
        num *
        _.mapValues(bodyMapping, function (value) {
          return BODYPART_COST[value]
        })[compiledElementList[index0 + 1]]
    }
  }
  // console.log(compiledElementList, cost);
  return cost
}

/**
 * 检查字符串合法
 * @param body body字符串
 * @returns 是否合乎规范
 */
export function check(body: string): boolean {
  if (!body) return false
  return checkRegExp.test(body)
}
