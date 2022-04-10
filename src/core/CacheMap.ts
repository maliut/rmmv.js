import {CacheEntry} from './CacheEntry'

export class CacheMap {

  manager: any
  _inner: Record<string, CacheEntry> = {}
  private _lastRemovedEntries: CacheEntry[] = []
  updateTicks = 0
  lastCheckTTL = 0
  delayCheckTTL = 100.0
  updateSeconds: number

  /**
   * Cache for images, audio, or any other kind of resource
   * @param manager
   * @constructor
   */
  constructor(manager) {
    this.manager = manager
    this.updateSeconds = Date.now()
  }

  /**
   * checks ttl of all elements and removes dead ones
   */
  checkTTL() {
    const cache = this._inner
    let temp = this._lastRemovedEntries
    if (!temp) {
      temp = []
      this._lastRemovedEntries = temp
    }
    for (const key in cache) {
      const entry = cache[key]
      if (!entry.isStillAlive()) {
        temp.push(entry)
      }
    }
    for (let i = 0; i < temp.length; i++) {
      temp[i].free(true)
    }
    temp.length = 0
  }

  /**
   * cache item
   * @param key url of cache element
   * @returns {*|null}
   */
  getItem(key) {
    const entry = this._inner[key]
    if (entry) {
      return entry.item
    }
    return null
  }

  clear() {
    const keys = Object.keys(this._inner)
    for (let i = 0; i < keys.length; i++) {
      this._inner[keys[i]].free()
    }
  }

  setItem(key, item) {
    return new CacheEntry(this, key, item).allocate()
  }

  update(ticks, delta) {
    this.updateTicks += ticks
    this.updateSeconds += delta
    if (this.updateSeconds >= this.delayCheckTTL + this.lastCheckTTL) {
      this.lastCheckTTL = this.updateSeconds
      this.checkTTL()
    }
  }
}
