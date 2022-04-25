declare let nw: any
declare let FPSMeter: any

declare class LZString {
  static compressToBase64(data: string | null): string
  static decompressFromBase64(data: string | null): string
}

declare namespace PIXI {
  namespace tilemap {
    namespace TileRenderer {
      let SCALE_MODE: number
      let DO_CLEAR: boolean
    }
    class RectTileLayer extends PIXI.Container {
      addRect(textureId, u, v, x, y, tileWidth, tileHeight, animX?, animY?)
    }
    class ZLayer extends PIXI.Container {
      constructor(tilemap: PIXI.Container, zIndex: number)
      clear()
      z: number
    }
    class CompositeRectTileLayer extends PIXI.Container {
      shadowColor: Float32Array
      constructor(zIndex: number, bitmaps: PIXI.Texture[], useSquare: number, texPerChild?: number)
      setBitmaps(bitmaps: PIXI.Texture[])
    }
  }

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
