export enum RoleEnum {
  MINER,
  CARRIER,
  UPGRADER,
  MAINTAINER
}

export interface IRole {
  run(): void
}
