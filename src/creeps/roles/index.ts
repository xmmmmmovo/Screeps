export interface IRole {
  run(creep: Creep): void
}

export enum Role {
  // 挖矿 不限于能量和矿物
  MINER = 'miner',
  // 建造
  BUILDER = 'builder',
  // 搬运者
  CARRIER = 'carrier',
  // 升级者 维护controller
  UPGRADER = 'upgrader',
  // 修理 只在tower之前有用
  REPAIRER = 'repairer',
  // 防卫
  DEFENDER = 'defender'
}

export type RoleNumBodyMap = Readonly<{ [key in Role]?: { num: number; body: BodyPartConstant[] } }>
