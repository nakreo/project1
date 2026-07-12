/**
 * ID 生成器
 * 使用计数器确保同一毫秒内 ID 不重复
 */
class IdGenerator {
  private counter = 0

  /** 生成唯一 ID */
  generate(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${this.counter++}`
  }
}

export const idGen = new IdGenerator()
