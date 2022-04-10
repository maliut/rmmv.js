declare let nw: any
declare let FPSMeter: any
declare let LZString: any

// todo 完善插件定义
declare namespace PIXI {
  const tilemap: any

  namespace extras {
    const PictureTilingSprite: typeof PIXI.extras.TilingSprite
  }
}

interface Number {
  clamp(min: number, max: number): number
  mod(n: number): number
  padZero(length: number): string
}

interface String {
  format(...args): string
  padZero(length: number): string
  contains(s: string): boolean
}

interface Array<T> {
  equals(a: T[]): boolean
  clone(): T[]
  contains(ele: T): boolean
}

interface Math {
  randomInt(max: number): number
}
