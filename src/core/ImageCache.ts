type CacheItem = { bitmap: any, touch: number, key: string, reservationId?: any }

export class ImageCache {
  static limit = 10 * 1000 * 1000

  private _items: Record<string, CacheItem>

  constructor() {
    this.initialize()
  }

  initialize() {
    this._items = {}
  }

  add(key: string, value: any) {
    this._items[key] = {
      bitmap: value,
      touch: Date.now(),
      key: key
    }

    this._truncateCache()
  }

  get(key: string): any {
    if (this._items[key]) {
      const item = this._items[key]
      item.touch = Date.now()
      return item.bitmap
    }

    return null
  }

  reserve(key: string, value: any, reservationId: any) {
    if (!this._items[key]) {
      this._items[key] = {
        bitmap: value,
        touch: Date.now(),
        key: key
      }
    }

    this._items[key].reservationId = reservationId
  }

  releaseReservation(reservationId) {
    const items = this._items

    // todo values
    Object.keys(items)
      .map(function (key) {
        return items[key]
      })
      .forEach((item) => {
        if (item.reservationId === reservationId) {
          delete item.reservationId
        }
      })
  }

  private _truncateCache() {
    const items = this._items
    let sizeLeft = ImageCache.limit

    Object.keys(items).map(function (key) {
      return items[key]
    }).sort(function (a, b) {
      return b.touch - a.touch
    }).forEach(function (item) {
      if (sizeLeft > 0 || this._mustBeHeld(item)) {
        const bitmap = item.bitmap
        sizeLeft -= bitmap.width * bitmap.height
      } else {
        delete items[item.key]
      }
    }.bind(this))
  }

  private _mustBeHeld(item: CacheItem) {
    // request only is weak so It's purgeable
    if (item.bitmap.isRequestOnly()) return false
    // reserved item must be held
    if (item.reservationId) return true
    // not ready bitmap must be held (because of checking isReady())
    if (!item.bitmap.isReady()) return true
    // then the item may purgeable
    return false
  }

  isReady() {
    const items = this._items
    return !Object.keys(items).some(function (key) {
      return !items[key].bitmap.isRequestOnly() && !items[key].bitmap.isReady()
    })
  }

  getErrorBitmap() {
    const items = this._items
    let bitmap = null
    if (Object.keys(items).some(function (key) {
      if (items[key].bitmap.isError()) {
        bitmap = items[key].bitmap
        return true
      }
      return false
    })) {
      return bitmap
    }

    return null
  }
}
