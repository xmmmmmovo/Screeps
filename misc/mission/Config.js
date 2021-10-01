const Config = {
  Staitc: 0x0100, // 静态类型
  Instance: 0x0200, // 实例类型
  Abstract: 0x0400, // 抽象类型
  Struct: 0x0800, // 结构体，拒绝子类继承
  Inheritance: 0x08000, // 此内容继承自子类型

  Public: 0x0001, // 公开权限
  Private: 0x0002, // 私有权限
  // 类型列表，string 类型名称 = int 类型id
  // 数据基于类型 self.id 查找对应的数据类型
  TypeList: {
    Class: 0,
    Exception: 1,
    MonoBehaviour: 2,
    OnceCode: 3,
    Statistics: 4,
    Vector2: 10,
    Mission: 11,
    MapCache: 12,
    SpawnComponent: 13, // fuck, global.Spawn是个函数
    RoomComponent: 14,
    TowerComponent: 15,
    CreepComponent: 16,
    ControllerComponent: 17,
    Soilder: 18,
    StorageComponent: 19,
    ArmyGroup: 20,
    LinkComponent: 21,
    BuildMission: 51,
    RepaireMission: 52,
    MoveToMission: 53,
    GatterMission: 54,
    UpgradeMission: 55,
    TransferMission: 56,
    ClaimMission: 57,
    OperatingMission: 58,
    Gatter: 101,
    Upgrade: 102,
    CreepExtension: 201
  },
  Army: require('Config.Army'),
  Creeps: require('Config.Creeps'),
  Map: require('Config.Map'),
  Mission: require('Config.Mission')
}

module.exports = Config
