import {Graphics} from './Graphics'

/**
 * The static class that handles resource loading.
 *
 * @class ResourceHandler
 */
export class ResourceHandler {
  private static _reloaders: (() => void)[] = []
  private static _defaultRetryInterval = [500, 1000, 3000]

  static createLoader(url: string, retryMethod: () => void, resignMethod: () => void, retryInterval = this._defaultRetryInterval) {
    const reloaders = this._reloaders
    let retryCount = 0
    return function() {
      if (retryCount < retryInterval.length) {
        setTimeout(retryMethod, retryInterval[retryCount])
        retryCount++
      } else {
        if (resignMethod) {
          resignMethod()
        }
        if (url) {
          if (reloaders.length === 0) {
            Graphics.printLoadingError(url)
            SceneManager.stop()
          }
          reloaders.push(function() {
            retryCount = 0
            retryMethod()
          })
        }
      }
    }
  }

  static exists() {
    return this._reloaders.length > 0
  }

  static retry() {
    if (this._reloaders.length > 0) {
      Graphics.eraseLoadingError()
      SceneManager.resume()
      this._reloaders.forEach(function(reloader) {
        reloader()
      })
      this._reloaders.length = 0
    }
  }
}
