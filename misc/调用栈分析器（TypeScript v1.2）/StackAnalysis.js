"use strict";
/* eslint-disable max-classes-per-file */
/*
 * @Author       : MiHack
 * @Version      : 1.2
 * @Date         : 2021-05-09
 * @Description  : CPU调用栈分析工具
 *                 基于：我叫次舌[W18N16] 调用栈分析器 1.2
 *                 QQ群：565401831
 * @Document     : 使用指南：
 *                     0.修改配置
 *                          修改该文件中的 CUSTOM_FUNCTION ，将需要分析的函数按照格式加入列表
 *                          如有必要，可以修改 STEP_TICKS 和 SAVE_TICKS 常量，变更分析的 Tick 范围
 *                     1.引用分析库
 *                          在 main.js 中引入该调用栈分析库：import { StackAnalysis } from "StackAnalysis";
 *                     2.挂载监听函数
 *                          在 main.js 的 loop 函数之外执行： StackAnalysis.mount() ，将挂载默认内置分析函数列表（游戏所有 API ）
 *                       2.1.注册自定义类、函数
 *                          也可以通过外部调用 StackAnalysis.register(name,parent,deep,isAction) ，注册分析监听
 *                       2.2.通过装饰器注册自定义类、函数
 *                          还可以引用装饰器：import { sa } from "StackAnalysis"; 通过装饰器 @sa 注册分析监听
 *                     3.包装主循环
 *                          将 loop 函数通过分析器包装： loop = StackAnalysis.wrap(loop); ，导出包装后的 loop
 *                     4.生成统计报告
 *                          至少运行一轮（ STEP_TICKS 个 Ticks ）后，执行 StackAnalysis.report(); 生成统计报告
 *                          StackAnalysis.report() 支持一个参数修改 LOCAL_COMPUTE （ true 时使用浏览器计算整合报告数据）
 *                          若需在控制台直接执行上述命令，请注意将 StackAnalysis 导出到 global
 *                          如：global.StackAnalysis = StackAnalysis
 *                 性能警告：
 *                    该分析工具默认会挂载游戏中大部分的 API 函数，一定程度上会增加 CPU 耗时，建议仅在需要分析时进行挂载运行
 *                    相对未挂载时，甚至可能增加多达 50% 左右的 CPU 消耗，请准备足够的剩余 CPU 用于运行分析工具
 *                    挂载后的第一个 Tick 会消耗大量的 CPU ，请预留足够的 bucket 以供加载使用（默认会检测 bucket 大于 500 才挂载）
 *                    当前默认会监听所有的行为函数（ 0.2CPU ）和高 CPU 消耗函数，如有必要可手动减少监听的函数（修改 REGISTER_ARGS ）
 *                    在代码运行稳定时，建议可以直接使用测试服（ https://screeps.com/ptr/ ）进行分析（可免费解锁 CPU 限制）
 *                 挂载警告：
 *                    该分析工具默认会将监听的函数设置为不可复写以避免重复包装，如有原型扩展等操作，请在执行分析工具前先执行原型扩展
 *                 报告指标：
 *                    totalCPU:0, // 总 CPU 耗时
 *                    callTimes:0, // 函数调用次数
 *                    actionCPU:0, // 行为 CPU 耗时
 *                    actionTimes:0, // 行为 CPU 耗时调用成功次数（返回 OK ）
 *                    pureCPU:0, // 纯当前函数耗时 （统计时计算 totalCPU - childTotalCPU ）
 *                    actionLess:0, // 非行为 CPU 耗时 （统计时计算 totalCPU - actionCPU ）
 *                 调试接口：
 *                    StackAnalysis.raw() 获取分析记录原始数据，不会生成 HTML
 *                    StackAnalysis.clear() 清空已采集数据，不会重新挂载，但重新统计数据
 *                    StackAnalysis.status() 数据采集状态，开始时间、已采集数量等
 *                    StackAnalysis.watching() 获取已挂载的函数及挂载耗时
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.sa = exports.StackAnalysis = void 0;
// 引用需要分析的类
// import { BuildingBase } from "../building/BuildingBase";
// import { BuildingMgr } from "../building/BuildingMgr";
// import { ConfigMgr } from "../config/ConfigMgr";
// import { EntityBase } from "../entity/EntityBase";
// import { EntityMgr } from "../entity/EntityMgr";
// import { RoleBase } from "../role/RoleBase";
// import { RoleMgr } from "../role/RoleMgr";
// import { WorldBase } from "../world/WorldBase";
// import { WorldMgr } from "../world/WorldMgr";
// 常量参数
var LOOP_NAME = "loop"; // loop 函数的名字
var STEP_TICKS = 10; // 每轮分析的 Tick 数，每 STEP_TICKS 个 Tick 将 CPU 耗时数据归档
var SAVE_TICKS = 500; // 所有分析的 Tick 数，超过 SAVE_TICKS 的 CPU 耗时数据将被丢弃
var ALLOW_REWRITE = false; // 允许函数重写，默认被包装的函数不允许再被重写，避免重复包装
var ENUM_DEEP = 10; // 枚举类属性层级深度
var IGNORE_PROPERTY = ["prototype", "length", "name"]; // 遍历时忽略包装的属性名列表
var IGNORE_PROPERTY_START = "_"; // 遍历时忽略包装的属性名开头，如设置为_时： _ignoreProperty:any 会被忽略
var BUCKET_LIMIT = 500; // 开启分析的 CPU 库存池下限，低于该下限时不挂载（ CPU 不足以挂载时会无限重新初始化）
var LOCAL_COMPUTE = true; // 本地计算模式（开启后会输出原始数据到报告，大量增加报告体积，但节省生成报告时CPU）
// 注册函数集开关，配置为{合集名称:[枚举深度,行为函数]}
var REGISTER_ARGS = {
    CUSTOM_FUNCTION: [0, false],
    CUSTOM_CLASS: [ENUM_DEEP, false],
    ACTION_FUNCTION: [0, true],
    HIGHT_FUNCTION: [0, false],
    MEDIUM_FUNCTION: [0, false],
    LOW_FUNCTION: [0, false],
    TINY_FUNCTION: [0, false],
    FOCUS_CLASS: [ENUM_DEEP, false]
};
// 自定义分析函数合集
var CUSTOM_FUNCTION = [
    { name: "Creep.say", parent: Creep.prototype },
    { name: "RoomVisual.text", parent: RoomVisual.prototype }
];
// 自定义分析的类合集
var CUSTOM_CLASS = [
// { name: "AnalysisMgr", parent: AnalysisMgr },
// { name: "ConfigMgr", parent: ConfigMgr },
// { name: "BuildingMgr", parent: BuildingMgr },
// { name: "EntityMgr", parent: EntityMgr },
// { name: "RoleMgr", parent: RoleMgr },
// { name: "WorldMgr", parent: WorldMgr },
// { name: "BuildingBase", parent: BuildingBase.prototype },
// { name: "EntityBase", parent: EntityBase.prototype },
// { name: "RoleBase", parent: RoleBase.prototype },
// { name: "WorldBase", parent: WorldBase.prototype }
];
// 行为函数集合（固定消耗 0.2 CPU ）
var ACTION_FUNCTION = [
    { name: "Game.notify", parent: Game },
    { name: "Game.market.cancelOrder", parent: Game.market },
    { name: "Game.market.changeOrderPrice", parent: Game.market },
    { name: "Game.market.createOrder", parent: Game.market },
    { name: "Game.market.deal", parent: Game.market },
    { name: "Game.market.extendOrder", parent: Game.market },
    { name: "ConstructionSite.remove", parent: ConstructionSite.prototype },
    { name: "Creep.attack", parent: Creep.prototype },
    { name: "Creep.attackController", parent: Creep.prototype },
    { name: "Creep.build", parent: Creep.prototype },
    { name: "Creep.claimController", parent: Creep.prototype },
    { name: "Creep.dismantle", parent: Creep.prototype },
    { name: "Creep.drop", parent: Creep.prototype },
    { name: "Creep.generateSafeMode", parent: Creep.prototype },
    { name: "Creep.harvest", parent: Creep.prototype },
    { name: "Creep.heal", parent: Creep.prototype },
    { name: "Creep.move", parent: Creep.prototype },
    { name: "Creep.moveByPath", parent: Creep.prototype },
    { name: "Creep.notifyWhenAttacked", parent: Creep.prototype },
    { name: "Creep.pickup", parent: Creep.prototype },
    { name: "Creep.rangedAttack", parent: Creep.prototype },
    { name: "Creep.rangedHeal", parent: Creep.prototype },
    { name: "Creep.rangedMassAttack", parent: Creep.prototype },
    { name: "Creep.repair", parent: Creep.prototype },
    { name: "Creep.reserveController", parent: Creep.prototype },
    { name: "Creep.signController", parent: Creep.prototype },
    { name: "Creep.suicide", parent: Creep.prototype },
    { name: "Creep.transfer", parent: Creep.prototype },
    { name: "Creep.upgradeController", parent: Creep.prototype },
    { name: "Creep.withdraw", parent: Creep.prototype },
    { name: "Flag.remove", parent: Flag.prototype },
    { name: "Flag.setColor", parent: Flag.prototype },
    { name: "Flag.setPosition", parent: Flag.prototype },
    { name: "OwnedStructure.destroy", parent: OwnedStructure.prototype },
    { name: "OwnedStructure.notifyWhenAttacked", parent: OwnedStructure.prototype },
    { name: "PowerCreep.delete", parent: PowerCreep.prototype },
    { name: "PowerCreep.drop", parent: PowerCreep.prototype },
    { name: "PowerCreep.enableRoom", parent: PowerCreep.prototype },
    { name: "PowerCreep.move", parent: PowerCreep.prototype },
    { name: "PowerCreep.moveByPath", parent: PowerCreep.prototype },
    { name: "PowerCreep.notifyWhenAttacked", parent: PowerCreep.prototype },
    { name: "PowerCreep.pickup", parent: PowerCreep.prototype },
    { name: "PowerCreep.renew", parent: PowerCreep.prototype },
    { name: "PowerCreep.spawn", parent: PowerCreep.prototype },
    { name: "PowerCreep.suicide", parent: PowerCreep.prototype },
    { name: "PowerCreep.transfer", parent: PowerCreep.prototype },
    { name: "PowerCreep.upgrade", parent: PowerCreep.prototype },
    { name: "PowerCreep.usePower", parent: PowerCreep.prototype },
    { name: "PowerCreep.withdraw", parent: PowerCreep.prototype },
    { name: "Room.createConstructionSite", parent: Room.prototype },
    { name: "Room.createFlag", parent: Room.prototype },
    { name: "RoomPosition.createConstructionSite", parent: RoomPosition.prototype },
    { name: "RoomPosition.createFlag", parent: RoomPosition.prototype },
    { name: "Structure.destroy", parent: Structure.prototype },
    { name: "Structure.notifyWhenAttacked", parent: Structure.prototype },
    { name: "StructureContainer.destroy", parent: StructureContainer.prototype },
    { name: "StructureContainer.notifyWhenAttacked", parent: StructureContainer.prototype },
    { name: "StructureController.destroy", parent: StructureController.prototype },
    { name: "StructureController.notifyWhenAttacked", parent: StructureController.prototype },
    { name: "StructureController.activateSafeMode", parent: StructureController.prototype },
    { name: "StructureController.unclaim", parent: StructureController.prototype },
    { name: "StructureExtension.destroy", parent: StructureExtension.prototype },
    { name: "StructureExtension.notifyWhenAttacked", parent: StructureExtension.prototype },
    { name: "StructureExtractor.destroy", parent: StructureExtension.prototype },
    { name: "StructureExtractor.notifyWhenAttacked", parent: StructureExtension.prototype },
    { name: "StructureFactory.destroy", parent: StructureFactory.prototype },
    { name: "StructureFactory.notifyWhenAttacked", parent: StructureFactory.prototype },
    { name: "StructureFactory.produce", parent: StructureFactory.prototype },
    { name: "StructureInvaderCore.destroy", parent: StructureInvaderCore.prototype },
    { name: "StructureInvaderCore.notifyWhenAttacked", parent: StructureInvaderCore.prototype },
    { name: "StructureKeeperLair.destroy", parent: StructureKeeperLair.prototype },
    { name: "StructureKeeperLair.notifyWhenAttacked", parent: StructureKeeperLair.prototype },
    { name: "StructureLab.destroy", parent: StructureLab.prototype },
    { name: "StructureLab.notifyWhenAttacked", parent: StructureLab.prototype },
    { name: "StructureLab.boostCreep", parent: StructureLab.prototype },
    { name: "StructureLab.reverseReaction", parent: StructureLab.prototype },
    { name: "StructureLab.runReaction", parent: StructureLab.prototype },
    { name: "StructureLab.unboostCreep", parent: StructureLab.prototype },
    { name: "StructureLink.destroy", parent: StructureLink.prototype },
    { name: "StructureLink.notifyWhenAttacked", parent: StructureLink.prototype },
    { name: "StructureLink.transferEnergy", parent: StructureLink.prototype },
    { name: "StructureNuker.destroy", parent: StructureNuker.prototype },
    { name: "StructureNuker.notifyWhenAttacked", parent: StructureNuker.prototype },
    { name: "StructureNuker.launchNuke", parent: StructureNuker.prototype },
    { name: "StructureObserver.destroy", parent: StructureObserver.prototype },
    { name: "StructureObserver.notifyWhenAttacked", parent: StructureObserver.prototype },
    { name: "StructureObserver.observeRoom", parent: StructureObserver.prototype },
    { name: "StructurePowerBank.destroy", parent: StructurePowerBank.prototype },
    { name: "StructurePowerBank.notifyWhenAttacked", parent: StructurePowerBank.prototype },
    { name: "StructurePowerSpawn.destroy", parent: StructurePowerSpawn.prototype },
    { name: "StructurePowerSpawn.notifyWhenAttacked", parent: StructurePowerSpawn.prototype },
    { name: "StructurePowerSpawn.processPower", parent: StructurePowerSpawn.prototype },
    { name: "StructurePortal.destroy", parent: StructurePortal.prototype },
    { name: "StructurePortal.notifyWhenAttacked", parent: StructurePortal.prototype },
    { name: "StructureRampart.destroy", parent: StructureRampart.prototype },
    { name: "StructureRampart.notifyWhenAttacked", parent: StructureRampart.prototype },
    { name: "StructureRampart.setPublic", parent: StructureRampart.prototype },
    { name: "StructureRoad.destroy", parent: StructureRoad.prototype },
    { name: "StructureRoad.notifyWhenAttacked", parent: StructureRoad.prototype },
    { name: "StructureSpawn.destroy", parent: StructureSpawn.prototype },
    { name: "StructureSpawn.notifyWhenAttacked", parent: StructureSpawn.prototype },
    { name: "StructureSpawn.createCreep", parent: StructureSpawn.prototype },
    { name: "StructureSpawn.spawnCreep", parent: StructureSpawn.prototype },
    { name: "StructureSpawn.recycleCreep", parent: StructureSpawn.prototype },
    { name: "StructureSpawn.renewCreep", parent: StructureSpawn.prototype },
    { name: "StructureSpawn.Spawning.cancel", parent: StructureSpawn.Spawning.prototype },
    { name: "StructureSpawn.Spawning.setDirections", parent: StructureSpawn.Spawning.prototype },
    { name: "StructureStorage.destroy", parent: StructureStorage.prototype },
    { name: "StructureStorage.notifyWhenAttacked", parent: StructureStorage.prototype },
    { name: "StructureTerminal.destroy", parent: StructureTerminal.prototype },
    { name: "StructureTerminal.notifyWhenAttacked", parent: StructureTerminal.prototype },
    { name: "StructureTerminal.send", parent: StructureTerminal.prototype },
    { name: "StructureTower.destroy", parent: StructureTower.prototype },
    { name: "StructureTower.notifyWhenAttacked", parent: StructureTower.prototype },
    { name: "StructureTower.attack", parent: StructureTower.prototype },
    { name: "StructureTower.heal", parent: StructureTower.prototype },
    { name: "StructureTower.repair", parent: StructureTower.prototype },
    { name: "StructureWall.destroy", parent: StructureWall.prototype },
    { name: "StructureWall.notifyWhenAttacked", parent: StructureWall.prototype }
];
// 高耗时函数集合
var HIGHT_FUNCTION = [
    // { name: "Game.cpu.generatePixel", parent: Game.cpu },
    { name: "Game.map.findExit", parent: Game.map },
    { name: "Game.map.findRoute", parent: Game.map },
    { name: "Game.market.getAllOrders", parent: Game.market },
    { name: "PathFinder.search", parent: PathFinder },
    { name: "Creep.moveTo", parent: Creep.prototype },
    { name: "PowerCreep.moveTo", parent: PowerCreep.prototype },
    { name: "Room.findExitTo", parent: Room.prototype },
    { name: "Room.findPath", parent: Room.prototype },
    { name: "RoomPosition.findClosestByPath", parent: RoomPosition.prototype },
    { name: "RoomPosition.findPathTo", parent: RoomPosition.prototype }
];
// 中耗时函数集合
var MEDIUM_FUNCTION = [
    { name: "Game.map.isRoomAvailable", parent: Game.map },
    { name: "Game.map.getRoomStatus", parent: Game.map },
    { name: "OwnedStructure.isActive", parent: OwnedStructure.prototype },
    { name: "Room.find", parent: Room.prototype },
    { name: "Room.lookAt", parent: Room.prototype },
    { name: "Room.lookAtArea", parent: Room.prototype },
    { name: "RoomPosition.findClosestByRange", parent: RoomPosition.prototype },
    { name: "RoomPosition.findInRange", parent: RoomPosition.prototype },
    { name: "RoomPosition.look", parent: RoomPosition.prototype },
    { name: "Structure.isActive", parent: Structure.prototype },
    { name: "StructureContainer.isActive", parent: StructureContainer.prototype },
    { name: "StructureController.isActive", parent: StructureController.prototype },
    { name: "StructureExtension.isActive", parent: StructureExtension.prototype },
    { name: "StructureExtractor.isActive", parent: StructureExtractor.prototype },
    { name: "StructureFactory.isActive", parent: StructureFactory.prototype },
    { name: "StructureInvaderCore.isActive", parent: StructureInvaderCore.prototype },
    { name: "StructureKeeperLair.isActive", parent: StructureKeeperLair.prototype },
    { name: "StructureLab.isActive", parent: StructureLab.prototype },
    { name: "StructureLink.isActive", parent: StructureLink.prototype },
    { name: "StructureNuker.isActive", parent: StructureNuker.prototype },
    { name: "StructureObserver.isActive", parent: StructureObserver.prototype },
    { name: "StructurePowerBank.isActive", parent: StructurePowerBank.prototype },
    { name: "StructurePowerSpawn.isActive", parent: StructurePowerSpawn.prototype },
    { name: "StructurePortal.isActive", parent: StructurePortal.prototype },
    { name: "StructureRampart.isActive", parent: StructureRampart.prototype },
    { name: "StructureRoad.isActive", parent: StructureRoad.prototype },
    { name: "StructureSpawn.isActive", parent: StructureSpawn.prototype },
    { name: "StructureStorage.isActive", parent: StructureStorage.prototype },
    { name: "StructureTerminal.isActive", parent: StructureTerminal.prototype },
    { name: "StructureTower.isActive", parent: StructureTower.prototype },
    { name: "StructureWall.isActive", parent: StructureWall.prototype }
];
// 低耗时函数集合
var LOW_FUNCTION = [
    // { name: "Game.cpu.getHeapStatistics", parent: Game.cpu },
    // { name: "Game.cpu.getUsed", parent: Game.cpu },
    // { name: "Game.cpu.halt", parent: Game.cpu },
    // { name: "Game.cpu.setShardLimits", parent: Game.cpu },
    // { name: "Game.cpu.unlock", parent: Game.cpu },
    { name: "Game.getObjectById", parent: Game },
    { name: "Game.map.describeExits", parent: Game.map },
    { name: "Game.map.getTerrainAt", parent: Game.map },
    { name: "Game.market.getHistory", parent: Game.market },
    { name: "Game.market.getOrderById", parent: Game.market },
    { name: "PathFinder.CostMatrix.clone", parent: PathFinder },
    { name: "PathFinder.CostMatrix.serialize", parent: PathFinder },
    { name: "PathFinder.CostMatrix.deserialize", parent: PathFinder },
    { name: "PowerCreep.create", parent: PowerCreep.prototype },
    { name: "Room.serializePath", parent: Room.prototype },
    { name: "Room.deserializePath", parent: Room.prototype },
    { name: "Room.getEventLog", parent: Room.prototype },
    { name: "Room.getPositionAt", parent: Room.prototype },
    { name: "Room.lookForAt", parent: Room.prototype },
    { name: "Room.lookForAtArea", parent: Room.prototype },
    { name: "Room.Terrain.getRawBuffer", parent: Room.Terrain.prototype },
    { name: "RoomPosition.getDirectionTo", parent: RoomPosition.prototype },
    { name: "RoomPosition.getRangeTo", parent: RoomPosition.prototype },
    { name: "RoomPosition.inRangeTo", parent: RoomPosition.prototype },
    { name: "RoomPosition.isEqualTo", parent: RoomPosition.prototype },
    { name: "RoomPosition.isNearTo", parent: RoomPosition.prototype },
    { name: "RoomPosition.lookFor", parent: RoomPosition.prototype },
    { name: "StructureSpawn.canCreateCreep", parent: StructureSpawn.prototype }
];
// 微耗时函数集合
var TINY_FUNCTION = [
    // 容错处理：SIM 中不存在 InterShardMemory
    { name: "InterShardMemory.getLocal", parent: typeof InterShardMemory === "undefined" ? {} : InterShardMemory },
    { name: "InterShardMemory.setLocal", parent: typeof InterShardMemory === "undefined" ? {} : InterShardMemory },
    { name: "InterShardMemory.getRemote", parent: typeof InterShardMemory === "undefined" ? {} : InterShardMemory },
    { name: "Game.map.getRoomLinearDistance", parent: Game.map },
    { name: "Game.map.getRoomTerrain", parent: Game.map },
    { name: "Game.map.getWorldSize", parent: Game.map },
    { name: "Game.map.visual.line", parent: Game.map.visual },
    { name: "Game.map.visual.circle", parent: Game.map.visual },
    { name: "Game.map.visual.rect", parent: Game.map.visual },
    { name: "Game.map.visual.poly", parent: Game.map.visual },
    { name: "Game.map.visual.text", parent: Game.map.visual },
    { name: "Game.map.visual.clear", parent: Game.map.visual },
    { name: "Game.map.visual.getSize", parent: Game.map.visual },
    { name: "Game.map.visual.export", parent: Game.map.visual },
    { name: "Game.map.visual.import", parent: Game.map.visual },
    { name: "Game.market.calcTransactionCost", parent: Game.market },
    { name: "PathFinder.use", parent: PathFinder },
    { name: "RawMemory.get", parent: RawMemory },
    { name: "RawMemory.set", parent: RawMemory },
    { name: "RawMemory.setActiveSegments", parent: RawMemory },
    { name: "RawMemory.setActiveForeignSegment", parent: RawMemory },
    { name: "RawMemory.setDefaultPublicSegment", parent: RawMemory },
    { name: "RawMemory.setPublicSegments", parent: RawMemory },
    { name: "Creep.cancelOrder", parent: Creep.prototype },
    { name: "Creep.getActiveBodyparts", parent: Creep.prototype },
    { name: "Creep.pull", parent: Creep.prototype },
    { name: "Creep.say", parent: Creep.prototype },
    { name: "PathFinder.CostMatrix.set", parent: PathFinder },
    { name: "PathFinder.CostMatrix.get", parent: PathFinder },
    { name: "PowerCreep.cancelOrder", parent: PowerCreep.prototype },
    { name: "PowerCreep.rename", parent: PowerCreep.prototype },
    { name: "PowerCreep.say", parent: PowerCreep.prototype },
    { name: "Room.getTerrain", parent: Room.prototype },
    { name: "Room.Terrain.constructor", parent: Room.prototype },
    { name: "Room.Terrain.get", parent: Room.prototype },
    { name: "RoomPosition.constructor", parent: RoomPosition.prototype },
    { name: "RoomVisual.constructor", parent: RoomVisual.prototype },
    { name: "RoomVisual.line", parent: RoomVisual.prototype },
    { name: "RoomVisual.circle", parent: RoomVisual.prototype },
    { name: "RoomVisual.rect", parent: RoomVisual.prototype },
    { name: "RoomVisual.poly", parent: RoomVisual.prototype },
    { name: "RoomVisual.text", parent: RoomVisual.prototype },
    { name: "RoomVisual.clear", parent: RoomVisual.prototype },
    { name: "RoomVisual.getSize", parent: RoomVisual.prototype },
    { name: "RoomVisual.export", parent: RoomVisual.prototype },
    { name: "RoomVisual.import", parent: RoomVisual.prototype }
    // Store 在 Screeps 的 d.ts 中未定义，实际在 global 上存在 Store ，如需使用需要在 d.ts 中定义 Store
    // { name: "Store.getCapacity", parent: global.Store },
    // { name: "Store.getFreeCapacity", parent: Store },
    // { name: "Store.getUsedCapacity", parent: Store }
];
// 重点关注的类（类会整体遍历，适合不挂载低、微函数时额外关注某些类，或需要挂载类中扩展的原型方法时使用）
var FOCUS_CLASS = [
    { name: "Room", parent: Room.prototype },
    { name: "Creep", parent: Creep.prototype },
    { name: "Structure", parent: Structure.prototype }
];
// 注册函数合集
var REGISTER_DIC = {
    CUSTOM_FUNCTION: CUSTOM_FUNCTION,
    CUSTOM_CLASS: CUSTOM_CLASS,
    ACTION_FUNCTION: ACTION_FUNCTION,
    HIGHT_FUNCTION: HIGHT_FUNCTION,
    MEDIUM_FUNCTION: MEDIUM_FUNCTION,
    LOW_FUNCTION: LOW_FUNCTION,
    TINY_FUNCTION: TINY_FUNCTION,
    FOCUS_CLASS: FOCUS_CLASS
};
// #endregion
/** ********************************************** 逻辑（雷区请勿修改） ************************************************** **/
// #region
/**
 * 分析对象
 */
var StackBase = /** @class */ (function () {
    /** 构造函数 */
    function StackBase(isActionCost) {
        if (isActionCost === void 0) { isActionCost = false; }
        /** 报告属性（不会在计算中赋值，用于报告数据） */
        this.pureCPU = 0; /** 纯耗时 CPU（统计时计算） totalCPU - childTotalCPU */
        this.actionLess = 0; /** 非行为 CPU（统计时计算） totalCPU - actionCPU */
        this.hasChild = false; /** 有子方法调用（统计时计算） */
        this.lastChild = [true]; /** 属性中的最后一个节点（统计时计算） */
        this.stackLevel = 0; /** 调用堆栈层级（统计时计算） */
        this.shortName = ""; /** 方法名称（统计时计算） */
        this.parentName = ""; /** 父级名称（统计时计算） */
        this.isAction = isActionCost;
        this.totalCPU = 0;
        this.callTimes = 0;
        this.actionCPU = 0;
        this.actionTimes = 0;
    }
    /** 记录耗时 */
    StackBase.prototype.record = function (cpu, isOK) {
        if (isOK === void 0) { isOK = true; }
        this.callTimes += 1;
        this.totalCPU += cpu;
        if (cpu >= 0.2 && this.isAction && isOK)
            this.actionCPU += cpu;
        if (cpu >= 0.2 && this.isAction && isOK)
            this.actionTimes += 1;
    };
    /**  清理记录数据 */
    StackBase.prototype.clear = function () {
        this.totalCPU = 0;
        this.callTimes = 0;
        this.actionCPU = 0;
        this.actionTimes = 0;
    };
    return StackBase;
}());
/**
 * 堆栈耗时分析
 */
var StackAnalysis = /** @class */ (function () {
    function StackAnalysis() {
    }
    // 注册分析函数
    StackAnalysis.register = function (name, // 函数名称
    parent, // 函数父对象
    deep, // 递归层数
    isAction // 行为标记
    ) {
        // 父对象不存在时，退出注册
        if (!parent) {
            return;
        }
        // 标记枚举子属性时，迭代所有元素
        if (deep > 0) {
            // 获取父级的所有属性名（使用 for 直接遍历父级会遗漏不可枚举属性，且错误遍历父级原型属性）
            var propertyNames = Object.getOwnPropertyNames(parent);
            for (var _i = 0, propertyNames_1 = propertyNames; _i < propertyNames_1.length; _i++) {
                var key = propertyNames_1[_i];
                // 跳过不需要分析的子属性
                if (!key || IGNORE_PROPERTY.includes(key) || key.startsWith(IGNORE_PROPERTY_START))
                    continue;
                // 获取属性描述符
                var descriptor = Object.getOwnPropertyDescriptor(parent, key);
                // 仅包装函数存在，且可写的函数（已包装过的函数会设置为不可写）
                if (descriptor && descriptor.value && descriptor.writable) {
                    // 如果是函数属性，使用非迭代方式进入包装流程
                    if (typeof descriptor.value === "function") {
                        StackAnalysis.register(name + "." + key, parent, 0, false);
                        // 如果是可迭代属性，继续迭代子级（限制 deep 层数）
                    }
                    else if (descriptor.enumerable) {
                        StackAnalysis.register(name + "." + key, descriptor.value, deep - 1, false);
                    }
                }
            }
        }
        else {
            // 属性名（取名称的最后一段）
            var key = name.split(".").slice(-1)[0];
            // 属性描述符
            var descriptor = Object.getOwnPropertyDescriptor(parent, key);
            // 仅包装函数存在，且可写的函数（已包装过的函数会设置为不可写）
            if (descriptor && descriptor.value && descriptor.writable) {
                if (typeof descriptor.value === "function") {
                    var wrapStart = Game.cpu.getUsed();
                    // 原始函数
                    var method_1 = descriptor.value;
                    // 包装函数
                    var wrapped = function () {
                        var _a;
                        var arg = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            arg[_i] = arguments[_i];
                        }
                        // 将堆栈名压入调用栈
                        StackAnalysis.callStack.push(name);
                        var stack = StackAnalysis.callStack.join("->");
                        var reCode;
                        // 计时开始
                        var start = Game.cpu.getUsed();
                        // 容错处理
                        try {
                            return (reCode = method_1.apply(this, arg));
                        }
                        finally {
                            // 计时结束
                            var end = Game.cpu.getUsed();
                            // 计算耗时
                            var cost = end - start;
                            // 检查耗时结构
                            StackAnalysis.recentRecord[stack] = (_a = StackAnalysis.recentRecord[stack]) !== null && _a !== void 0 ? _a : new StackBase(isAction);
                            // 记录耗时数据
                            StackAnalysis.recentRecord[stack].record(cost, reCode === OK);
                            // 从调用栈中出栈堆栈名
                            StackAnalysis.callStack.pop();
                        }
                    };
                    // 在父级上重新定义包装函数
                    Object.defineProperty(parent, key, __assign(__assign({}, descriptor), { value: wrapped, writable: ALLOW_REWRITE // 阻止该函数再次重写
                     }));
                    var wrapEnd = Game.cpu.getUsed();
                    // 将包装耗时记录，便于调试
                    StackAnalysis.registerRecord[name] = wrapEnd - wrapStart;
                }
            }
        }
    };
    // 测试类包装迭代
    StackAnalysis["try"] = function (name, parent, deep) {
        if (deep > 0) {
            // 获取父级的所有属性名（使用for直接遍历父级会遗漏不可枚举属性，且错误遍历父级原型属性）
            var propertyNames = Object.getOwnPropertyNames(parent);
            for (var _i = 0, propertyNames_2 = propertyNames; _i < propertyNames_2.length; _i++) {
                var key = propertyNames_2[_i];
                // 跳过不需要分析的子属性
                if (!key || IGNORE_PROPERTY.includes(key) || key.startsWith(IGNORE_PROPERTY_START))
                    continue;
                // 获取属性描述符
                var descriptor = Object.getOwnPropertyDescriptor(parent, key);
                // 仅包装函数存在，且可写的函数（已包装过的函数会设置为不可写）
                if (descriptor && descriptor.value && descriptor.writable) {
                    // 如果是函数属性，使用非迭代方式进入包装流程
                    if (typeof descriptor.value === "function") {
                        StackAnalysis.register(name + "." + key, parent, 0, false);
                        // 如果是可迭代属性，继续迭代子级（限制 deep 层数）
                    }
                    else if (descriptor.enumerable) {
                        StackAnalysis.register(name + "." + key, descriptor.value, deep - 1, false);
                    }
                }
            }
        }
        else {
            console.log(deep, name);
        }
    };
    // 旧数据归档
    StackAnalysis.archive = function (loopName) {
        // 初始化后已经经过的 Ticks
        var elapsed = Game.time - StackAnalysis.startTime;
        // 经过的 Ticks 是步长的整数倍时，归档
        var isSave = elapsed % STEP_TICKS === 0;
        // 归档时将数据写入历史，清空当前记录
        if (isSave) {
            // 未超过一个分析步长 Tick 时，不会归档
            if (elapsed >= STEP_TICKS) {
                var archiveStart = Game.cpu.getUsed();
                if (Object.keys(StackAnalysis.recentRecord).length > 0) {
                    StackAnalysis.historyRecord[Game.time % SAVE_TICKS] = StackAnalysis.recentRecord;
                }
                // 使用清理方法（下一轮不会再 new StackBase() ）
                Object.keys(StackAnalysis.recentRecord).forEach(function (recordName) { return StackAnalysis.recentRecord[recordName].clear(); });
                var recordCount = Object.keys(StackAnalysis.historyRecord).length;
                var archiveEnd = Game.cpu.getUsed();
                console.log("\u5F52\u6863\u8017\u65F6\uFF08\u8BC4\u4F30\uFF09\uFF1A" + (archiveEnd - archiveStart) + " \u5DF2\u91C7\u96C6\uFF1A" + recordCount + "/" + SAVE_TICKS / STEP_TICKS + " \u8F6E\u6570\u636E");
            }
            else {
                console.log("\u9996\u6B21\u5FAA\u73AF\uFF08\u8BC4\u4F30\uFF09\uFF1A" + StackAnalysis.recentRecord[loopName].totalCPU + " CPU\u5E93\u5B58\uFF1A" + Game.cpu.bucket);
            }
        }
    };
    // 强制清理缓存数据（重新记录）
    StackAnalysis.clear = function () {
        StackAnalysis.startTime = Game.time;
        StackAnalysis.callStack = [];
        StackAnalysis.recentRecord = {};
        StackAnalysis.historyRecord = {};
    };
    // 分析状态（便于确认是否已采集足够的数据打印报告）
    StackAnalysis.status = function () {
        return {
            stepTicks: STEP_TICKS,
            saveTicks: SAVE_TICKS,
            startTime: StackAnalysis.startTime,
            elapsedTime: Game.time - StackAnalysis.startTime,
            recentRecord: Object.keys(StackAnalysis.recentRecord).length,
            historyRecord: Object.keys(StackAnalysis.historyRecord).length,
            registerRecord: Object.keys(StackAnalysis.registerRecord).length
        };
    };
    // 正在监听的函数记录
    StackAnalysis.watching = function () {
        return StackAnalysis.registerRecord;
    };
    // 包装循环函数
    StackAnalysis.wrap = function (loop, loopName) {
        if (loopName === void 0) { loopName = LOOP_NAME; }
        // 返回循环函数
        return function () {
            var _a;
            var loopStart = Game.cpu.getUsed();
            // 记录运行到的函数堆栈
            StackAnalysis.callStack = [loopName];
            // 初始化当前 Tick 调用记录
            StackAnalysis.recentRecord[loopName] = (_a = StackAnalysis.recentRecord[loopName]) !== null && _a !== void 0 ? _a : new StackBase(false);
            loop();
            var loopEnd = Game.cpu.getUsed();
            // 记录 loop 函数耗时
            StackAnalysis.recentRecord[loopName].record(loopEnd - loopStart);
            // 归档已记录的数据
            StackAnalysis.archive(loopName);
        };
    };
    // 检查函数包装
    StackAnalysis.check = function (parent, key) {
        Object.getOwnPropertyDescriptor(parent, key);
    };
    // 挂载包装函数
    StackAnalysis.mount = function () {
        if (Game.cpu.tickLimit < BUCKET_LIMIT) {
            return "\u53EF\u7528CPU\u5E93\u5B58\u6C60\u4E0D\u8DB3\uFF08" + Game.cpu.bucket + "<" + BUCKET_LIMIT + "\uFF09\uFF0C\u6682\u4E0D\u542F\u7528\u5806\u6808\u5206\u6790\uFF01";
        }
        var mountStart = Game.cpu.getUsed();
        // 遍历注册函数合集
        var registerTime = Object.entries(REGISTER_DIC).map(function (_a) {
            var _b;
            var key = _a[0], defined = _a[1];
            var registerStart = Game.cpu.getUsed();
            var registerArgs = REGISTER_ARGS[key];
            // 注册函数参数开启时，才进行注册挂载
            if (registerArgs) {
                defined.forEach(function (_a) {
                    var name = _a.name, parent = _a.parent;
                    return StackAnalysis.register(name, parent, registerArgs[0], registerArgs[1]);
                });
            }
            var registerEnd = Game.cpu.getUsed();
            return _b = {}, _b[key] = registerEnd - registerStart, _b;
        });
        var mountEnd = Game.cpu.getUsed();
        console.log("\u6302\u8F7D\u8017\u65F6\uFF08\u8BC4\u4F30\uFF09\uFF1A" + (mountEnd - mountStart) + " CPU\u5E93\u5B58\uFF1A" + Game.cpu.bucket);
        return Object.assign.apply(Object, __spreadArray([{}], registerTime));
    };
    // 报告原始数据
    StackAnalysis.raw = function () {
        console.log("\u6B63\u5728\u751F\u6210\u539F\u59CB\u6570\u636E...");
        var rawStart = Game.cpu.getUsed();
        console.log(JSON.stringify(StackAnalysis.historyRecord));
        var rawEnd = Game.cpu.getUsed();
        console.log("\u6570\u636E\u8017\u65F6\uFF08\u8BC4\u4F30\uFF09\uFF1A" + (rawEnd - rawStart));
    };
    // 生成统计报告
    StackAnalysis.report = function (localCompute) {
        if (localCompute === void 0) { localCompute = LOCAL_COMPUTE; }
        if (Object.keys(StackAnalysis.historyRecord).length < 2) {
            console.log("\u7EDF\u8BA1\u62A5\u544A\u6240\u9700\u6570\u636E\u4E0D\u8DB3\uFF0C\u8BF7\u91C7\u96C6\u81F3\u5C112\u8F6E\u6570\u636E\u540E\uFF0C\u518D\u751F\u6210\u7EDF\u8BA1\u62A5\u544A\uFF01");
            return;
        }
        else {
            console.log("\u6B63\u5728\u751F\u6210\u7EDF\u8BA1\u62A5\u544A...");
        }
        var reportStart = Game.cpu.getUsed();
        // 整合数据（当前是生成时计算，会消耗 CPU 时间；可以考虑调整为报告中计算，但是会增加输出报告体积）
        var makeReport = function (reportRecord) {
            return Object.values(reportRecord).reduce(function (all, one) {
                Object.entries(one)
                    .sort()
                    .forEach(function (_a, index, array) {
                    var name = _a[0], info = _a[1];
                    if (!all[name]) {
                        all[name] = new StackBase(info.isAction);
                    }
                    /** 统计属性 */
                    all[name].totalCPU += info.totalCPU;
                    all[name].callTimes += info.callTimes;
                    all[name].actionCPU += info.actionCPU;
                    all[name].actionTimes += info.actionTimes;
                    all[name].actionLess += info.totalCPU - info.actionCPU;
                    /** 计算属性 */
                    var stackLevel = name.split("->").length; /** 栈深，loop 为零 */
                    var shortName = name.split("->").slice(-1)[0]; /** 短名 */
                    var parentName = name.split("->").slice(0, -1).join("->") || "_"; /** 父级，loop 父级为 ""，标记为 _ */
                    var childName = name + "->.*"; /** 子级 */
                    var grandchildName = name + "->.*->.*"; /** 孙级 */
                    var childKvList = array.filter(function (_a) {
                        var k2 = _a[0], v2 = _a[1];
                        return RegExp(childName).exec(k2) && !RegExp(grandchildName).exec(k2);
                    }); /** 直接子级（非孙级） */
                    var brotherName = parentName + "->.*"; /** 平级 */
                    var nephewName = parentName + "->.*->.*"; /** 侄级 */
                    var brotherKvList = array.filter(function (_a) {
                        var k2 = _a[0], v2 = _a[1];
                        return RegExp(brotherName).exec(k2) && !RegExp(nephewName).exec(k2);
                    }); /** 直接平级（非侄级） */
                    var childCPU = childKvList.length > 0 ? childKvList.reduce(function (a, o) { return a + o[1].totalCPU; }, 0) : 0;
                    all[name].pureCPU += info.totalCPU - childCPU;
                    all[name].hasChild = childKvList.length > 0;
                    all[name].stackLevel = stackLevel;
                    all[name].lastChild = parentName === "_" ? one[name].lastChild : __spreadArray([], all[parentName].lastChild);
                    all[name].lastChild[stackLevel] =
                        brotherKvList.length > 0 ? name === brotherKvList[brotherKvList.length - 1][0] : true;
                    all[name].shortName = shortName;
                    all[name].parentName = parentName;
                });
                return all;
            });
        };
        // 运行总跨越 Tick
        var runTicks = Object.keys(StackAnalysis.historyRecord).length * STEP_TICKS;
        // 报告原始数据（开启本机计算时，输出到报告）
        var reportRaw = localCompute ? StackAnalysis.historyRecord : null;
        // 整合后的报告数据（开启本地计算时不计算）
        var reportRipe = localCompute ? null : makeReport(StackAnalysis.historyRecord);
        // 折叠状态
        var foldStatus = {};
        // 折叠按钮
        var drawFold = function (name) {
            if (foldStatus[name]) {
                return "<span onclick=\"switchFold('" + name + "')\">[+]</span>";
            }
            else {
                return "<span onclick=\"switchFold('" + name + "')\">[-]</span>";
            }
        };
        // 判断隐藏
        var isHide = function (parent) {
            /** 父级有在隐藏字典中则隐藏 */
            var matchParent = Object.entries(foldStatus).filter(function (_a) {
                var k = _a[0], v = _a[1];
                return v && parent.startsWith(k);
            });
            return matchParent.length > 0;
        };
        // 添加颜色
        var printColor = function (type, value, level) {
            if (level === void 0) { level = 0; }
            var levelColor;
            switch (type) {
                case "name":
                    levelColor = [
                        "#c00000",
                        "#ff0000",
                        "#ffc000",
                        "#ffff00",
                        "#92d050",
                        "#00b050",
                        "#00b0f0",
                        "#0070c0",
                        "#002060",
                        "#7030a0"
                    ];
                    return "<span style=\"color:" + levelColor[level % 10] + "\">" + value + "</span>";
                case "cpu":
                    levelColor = ["#ffcccc", "#ffaaaa", "#ff8888", "#ff6666", "#ff4444", "#ff2222", "#ff0000"];
                    level =
                        value < 0.01 ? 0 : value < 0.1 ? 1 : value < 1 ? 2 : value < 3 ? 3 : value < 6 ? 4 : value < 12 ? 5 : 6;
                    return "<span style=\"color:" + levelColor[level] + "\">" + Number(value).toFixed(2) + "</span>";
                case "times":
                    levelColor = ["#ccccff", "#aaaaff", "#8888ff", "#6666ff", "#4444ff", "#2222ff", "#0000ff"];
                    level =
                        value < 1 ? 0 : value < 3 ? 1 : value < 10 ? 2 : value < 20 ? 3 : value < 50 ? 4 : value < 100 ? 5 : 6;
                    return "<span style=\"color:" + levelColor[level] + "\">" + Number(value).toFixed(2) + "</span>";
                case "none":
                    return "<span>" + value + "</span>";
                default:
                    return "[Undefined Color Type]";
            }
        };
        // 组合表格
        var makeTable = function (reportData) {
            var kvPairs = Object.entries(reportData).sort();
            return kvPairs.map(function (_a, index) {
                var key = _a[0], value = _a[1];
                var tree = __spreadArray([], value.lastChild).slice(2) /** 去掉首位 */
                    .map(function (v, i, a) {
                    return i === a.length - 1
                        ? v
                            ? printColor("none", "&nbsp;└─")
                            : printColor("none", "&nbsp;├─")
                        : v
                            ? printColor("none", "&nbsp;&nbsp;&nbsp;")
                            : printColor("name", "&nbsp;|&nbsp;", i + 2);
                })
                    .join("");
                var fold = value.hasChild ? drawFold(key) : "<span>[·]</span>";
                var name = "<span title=\"" + key + "\"> " + value.shortName + "</span>";
                var cols = [
                    printColor("name", [tree, fold, name].join(""), value.stackLevel),
                    printColor("cpu", value.totalCPU / runTicks),
                    printColor("times", value.callTimes / runTicks),
                    printColor("cpu", value.pureCPU / runTicks),
                    printColor("cpu", value.actionCPU / runTicks),
                    printColor("times", value.actionTimes / runTicks),
                    printColor("cpu", value.actionLess / runTicks)
                ];
                return isHide(value.parentName) ? "" : "<tr><td>" + cols.join("</td><td>") + "</td></tr>";
            });
        };
        // 切换折叠（引用的 refreshTable 使用字符串，因此该函数也使用字符串）
        var switchFold = "function (name) {\n      foldStatus[name] = !foldStatus[name];\n      refreshTable();\n    };";
        // 复制报告（会调用 document ，因此使用字符串）
        var copyReport = "function () {\n      const element = document.getElementById(\"Report" + Game.time + "\");\n      const inputTag = document.createElement(\"input\");\n      inputTag.value = element.outerHTML;\n      document.body.appendChild(inputTag);\n      inputTag.select();\n      document.execCommand(\"copy\");\n      setTimeout(function () {\n        inputTag.remove();\n        alert(\"\u62A5\u544A\u5DF2\u590D\u5236\u5230\u526A\u5207\u677F\uFF01\")\n      }, 100);\n    }";
        // 下载报告（会调用 document ，因此使用字符串）
        var downloadReport = "function () {\n      const element = document.getElementById(\"Report" + Game.time + "\");\n      const blob = new Blob([element.outerHTML]);\n      const aTag = document.createElement(\"a\");\n      aTag.style = \"display: none\";\n      aTag.download = \"StackAnalysis" + Game.time + ".html\";\n      aTag.href = URL.createObjectURL(blob);\n      document.body.appendChild(aTag);\n      aTag.click();\n      setTimeout(function () {\n        document.body.removeChild(aTag);\n        window.URL.revokeObjectURL(blob);\n      }, 100);\n    }";
        // 刷新表格（会调用 document ，因此使用字符串）
        var refreshTable = "function () {\n      const header = [\n        \"StackAnalysis Shard: " + Game.shard.name + " Start: " + Game.time + " Elapsed: " + runTicks + " <span onclick=\\\"copyReport()\\\">[\u590D\u5236\u62A5\u544A]</span> <span onclick=\\\"downloadReport()\\\">[\u4E0B\u8F7D\u62A5\u544A]</span>\",\n        \"totalCPU\",\n        \"callTimes\",\n        \"pureCPU\",\n        \"actionCPU\",\n        \"actionTimes\",\n        \"actionLess\"\n      ];\n      document.getElementById(\"Tree" + Game.time + "\").innerHTML = [\n        \"<tr><td>\" + header.join(\"</td><td>\") + \"</td></tr>\",\n        ...makeTable(reportRipe || (reportRipe = makeReport(reportRaw)))\n      ].join(\"\r\n\");\n    };";
        // 页面分块
        var style = "<style>\n        table#Tree" + Game.time + " {\n            width: 95vw;\n            color: #eeeeee;\n            font-family: Consolas;\n            background-color: #2b2b2b;\n            border-collapse: collapse;\n        }\n        table#Tree" + Game.time + " tr {\n            border: 1px solid #0b0b0b;\n        }\n        table#Tree" + Game.time + " tr:hover {\n            border-bottom: 1px solid red;\n        }\n        table#Tree" + Game.time + " tr:nth-of-type(even) {\n            background: #3b3b3b;\n        }\n    </style>";
        var head = "<div id=\"Report" + Game.time + "\">";
        var html = "<table id=\"Tree" + Game.time + "\"></table>";
        var data = "<script>\n    var gameTick = " + JSON.stringify(StackAnalysis.startTime) + ";\n    var runTicks = " + JSON.stringify(runTicks) + ";\n    var reportRaw = " + JSON.stringify(reportRaw) + ";\n    var reportRipe = " + JSON.stringify(reportRipe) + ";\n    var foldStatus = foldStatus || " + JSON.stringify(foldStatus) + ";\n    </script>";
        var script = "<script>\n    var StackBase = " + StackBase.toString() + ";\n    var drawFold = " + drawFold.toString() + ";\n    var makeReport = " + makeReport.toString() + ";\n    var makeTable = " + makeTable.toString() + ";\n    var isHide = " + isHide.toString() + ";\n    var printColor = " + printColor.toString() + ";\n    var switchFold = " + switchFold.toString() + ";\n    var copyReport = " + copyReport.toString() + ";\n    var downloadReport = " + downloadReport.toString() + ";\n    var refreshTable = " + refreshTable.toString() + ";\n    refreshTable();\n    </script>";
        var foot = "<div>";
        // 组装报告
        var reportBody = [head, style, html, data, script, foot].join("").replace(/[\r\n]/g, "");
        console.log(reportBody);
        var reportEnd = Game.cpu.getUsed();
        console.log("\u7EDF\u8BA1\u8017\u65F6\uFF08\u8BC4\u4F30\uFF09\uFF1A" + (reportEnd - reportStart));
    };
    StackAnalysis.startTime = Game.time; // 起始 Tick ，代码初始化时记录
    StackAnalysis.callStack = []; // 当前函数栈（用于记录调用层级）
    StackAnalysis.recentRecord = {}; // 当前记录的 Tick 耗时 CPU ，对应 stepTicks
    StackAnalysis.historyRecord = {}; // 历史归档的 Tick 耗时 CPU ，对应 saveTicks
    StackAnalysis.registerRecord = {}; // 挂载记录
    return StackAnalysis;
}());
exports.StackAnalysis = StackAnalysis;
/**
 * 注册装饰器
 * 可装饰类和方法，请勿装饰属性和参数
 * @param name 方法名称，未指定时自动推断
 * @returns
 */
function sa(name) {
    return function (target, property, descriptor) {
        var _a, _b, _c, _d;
        // 类装饰器判断
        function isClass(descLike) {
            return property === undefined;
        }
        // 判断是类装饰器时遍历，否则装饰方法
        if (isClass(target)) {
            // 注册静态方法
            StackAnalysis.register((_a = name !== null && name !== void 0 ? name : target.name) !== null && _a !== void 0 ? _a : "", target, ENUM_DEEP, false);
            // 注册动态方法
            StackAnalysis.register((_b = name !== null && name !== void 0 ? name : target.name) !== null && _b !== void 0 ? _b : "", target.prototype, ENUM_DEEP, false);
        }
        else {
            // 静态方法直接推断类名称，动态方法从构造器推断类名称
            StackAnalysis.register(name !== null && name !== void 0 ? name : ((_d = (_c = target.name) !== null && _c !== void 0 ? _c : target.constructor.name) !== null && _d !== void 0 ? _d : "") + "." + (property !== null && property !== void 0 ? property : ""), target, 0, false);
        }
    };
}
exports.sa = sa;
// #endregion
/** ********************************************** 结束（最后的分割线） ************************************************** **/
