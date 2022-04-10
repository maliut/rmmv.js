import {CacheMap} from './CacheMap'

export class CacheEntry {

  cache: CacheMap // todo
  key: string
  item: any // todo
  cached = false
  touchTicks = 0
  touchSeconds = 0
  ttlTicks = 0
  ttlSeconds = 0
  freedByTTL = false

  /**
   * The resource class. Allows to be collected as a garbage if not use for some time or ticks
   *
   * @class CacheEntry
   * @constructor
   * @param cache resource manager
   * @param {string} key, url of the resource
   * @param {string} item - Bitmap, HTML5Audio, WebAudio - whatever you want to store in the cache
   */
  constructor(cache, key, item) {
    this.cache = cache
    this.key = key
    this.item = item
  }

  /**
   * frees the resource
   */
  free(byTTL = false) {
    this.freedByTTL = byTTL
    if (this.cached) {
      this.cached = false
      delete this.cache._inner[this.key]
    }
  }

  /**
   * Allocates the resource
   * @returns {CacheEntry}
   */
  allocate(): CacheEntry {
    if (!this.cached) {
      this.cache._inner[this.key] = this
      this.cached = true
    }
    this.touch()
    return this
  }

  /**
   * Sets the time to live
   * @param {number} ticks TTL in ticks, 0 if not set
   * @param {number} seconds TTL in seconds, 0 if not set
   * @returns {CacheEntry}
   */
  setTimeToLive(ticks = 0, seconds = 0): CacheEntry {
    this.ttlTicks = ticks
    this.ttlSeconds = seconds
    return this
  }

  isStillAlive() {
    const cache = this.cache
    return ((this.ttlTicks == 0) || (this.touchTicks + this.ttlTicks < cache.updateTicks)) &&
      ((this.ttlSeconds == 0) || (this.touchSeconds + this.ttlSeconds < cache.updateSeconds))
  }

  /**
   * makes sure that resource wont freed by Time To Live
   * if resource was already freed by TTL, put it in cache again
   */
  touch() {
    const cache = this.cache
    if (this.cached) {
      this.touchTicks = cache.updateTicks
      this.touchSeconds = cache.updateSeconds
    } else if (this.freedByTTL) {
      this.freedByTTL = false
      if (!cache._inner[this.key]) {
        cache._inner[this.key] = this
      }
    }
  }
}
