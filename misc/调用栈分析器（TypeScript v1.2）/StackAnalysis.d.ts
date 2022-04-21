/**
 * 堆栈耗时分析
 */
export declare class StackAnalysis {
  private static startTime
  private static callStack
  private static recentRecord
  private static historyRecord
  private static registerRecord
  static register(
    name: string, // 函数名称
    parent: Record<PropertyKey, any>, // 函数父对象
    deep: number, // 递归层数
    isAction: boolean
  ): void
  static try(name: string, parent: Record<PropertyKey, any>, deep: number): void
  static archive(loopName: string): void
  static clear(): void
  static status(): {
    stepTicks: number
    saveTicks: number
    startTime: any
    elapsedTime: number
    recentRecord: number
    historyRecord: number
    registerRecord: number
  }
  static watching(): Record<string, number>
  static wrap(loop: () => void, loopName?: string): () => void
  static check(parent: any, key: PropertyKey): void
  static mount(): string | Record<string, number>
  static raw(): void
  static report(localCompute?: boolean): void
}
interface ClassTarget {
  name: string
  prototype: MethodTarget
}
interface MethodTarget {
  constructor: {
    name: string
  }
  name?: string
}
/**
 * 注册装饰器
 * 可装饰类和方法，请勿装饰属性和参数
 * @param name 方法名称，未指定时自动推断
 * @returns
 */
export declare function sa(
  name?: string
): (target: ClassTarget | MethodTarget, property?: string, descriptor?: PropertyDescriptor) => void
export {}
/** ********************************************** 结束（最后的分割线） ************************************************** **/
//# sourceMappingURL=StackAnalysis.d.ts.map
