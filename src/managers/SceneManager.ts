import {Utils} from '../core/Utils'
import {Bitmap} from '../core/Bitmap'
import {Graphics} from '../core/Graphics'
import {WebAudio} from '../core/WebAudio'
import {Input} from '../core/Input'
import {TouchInput} from '../core/TouchInput'
import {AudioManager} from './AudioManager'
import {ImageManager} from './ImageManager'
import {PluginManager} from './PluginManager'
import {Scene_Base} from '../scenes/Scene_Base'

// SceneManager
//
// The static class that manages scene transitions.
export class SceneManager {

  /*
   * Gets the current time in ms without on iOS Safari.
   * @private
   */
  static _getTimeInMsWithoutMobileSafari() {
    return performance.now()
  }

  static _currentTime = 0

  private static _scene: Scene_Base | null = null
  private static _nextScene: Scene_Base | null = null
  private static _stack: ((new() => Scene_Base) | null)[] = []
  private static _stopped = false
  private static _sceneStarted = false
  private static _exiting = false
  private static _previousClass: (new() => Scene_Base) | null = null
  private static _backgroundBitmap: Bitmap | null = null
  private static _screenWidth = 816
  private static _screenHeight = 624
  private static _boxWidth = 816
  private static _boxHeight = 624
  private static _deltaTime = 1.0 / 60.0
  private static _accumulator = 0.0

  static run<T extends Scene_Base>(sceneClass: new() => T) {
    try {
      this.initialize()
      this.goto(sceneClass)
      this.requestUpdate()
    } catch (e) {
      this.catchException(e)
    }
  }

  static initialize() {
    this.initGraphics()
    this.checkFileAccess()
    this.initAudio()
    this.initInput()
    this.initNwjs()
    this.checkPluginErrors()
    this.setupErrorHandlers()
  }

  static initGraphics() {
    const type = this.preferableRendererType()
    Graphics.initialize(this._screenWidth, this._screenHeight, type)
    Graphics.boxWidth = this._boxWidth
    Graphics.boxHeight = this._boxHeight
    Graphics.setLoadingImage('img/system/Loading.png')
    if (Utils.isOptionValid('showfps')) {
      Graphics.showFps()
    }
    if (type === 'webgl') {
      this.checkWebGL()
    }
  }

  static preferableRendererType() {
    if (Utils.isOptionValid('canvas')) {
      return 'canvas'
    } else if (Utils.isOptionValid('webgl')) {
      return 'webgl'
    } else {
      return 'auto'
    }
  }

  static shouldUseCanvasRenderer() {
    return Utils.isMobileDevice()
  }

  static checkWebGL() {
    if (!Graphics.hasWebGL()) {
      throw new Error('Your browser does not support WebGL.')
    }
  }

  static checkFileAccess() {
    if (!Utils.canReadGameFiles()) {
      throw new Error('Your browser does not allow to read local files.')
    }
  }

  static initAudio() {
    const noAudio = Utils.isOptionValid('noaudio')
    if (!WebAudio.initialize(noAudio) && !noAudio) {
      throw new Error('Your browser does not support Web Audio API.')
    }
  }

  static initInput() {
    Input.initialize()
    TouchInput.initialize()
  }

  static initNwjs() {
    if (Utils.isNwjs()) {
      const gui = globalThis.require('nw.gui')
      const win = gui.Window.get()
      if (process.platform === 'darwin' && !win.menu) {
        const menubar = new gui.Menu({type: 'menubar'})
        const option = {hideEdit: true, hideWindow: true}
        menubar.createMacBuiltin('Game', option)
        win.menu = menubar
      }
    }
  }

  static checkPluginErrors() {
    PluginManager.checkErrors()
  }

  static setupErrorHandlers() {
    window.addEventListener('error', this.onError.bind(this))
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  static requestUpdate() {
    if (!this._stopped) {
      requestAnimationFrame(this.update.bind(this))
    }
  }

  static update() {
    try {
      this.tickStart()
      if (Utils.isMobileSafari()) {
        this.updateInputData()
      }
      this.updateManagers()
      this.updateMain()
      this.tickEnd()
    } catch (e) {
      this.catchException(e)
    }
  }

  static terminate() {
    window.close()
  }

  static onError(e) {
    console.error(e.message)
    console.error(e.filename, e.lineno)
    try {
      this.stop()
      Graphics.printError('Error', e.message)
      AudioManager.stopAll()
    } catch (e2) {
      // ignore
    }
  }

  static onKeyDown(event) {
    if (!event.ctrlKey && !event.altKey) {
      switch (event.keyCode) {
      case 116:   // F5
        if (Utils.isNwjs()) {
          location.reload()
        }
        break
      case 119:   // F8
        if (Utils.isNwjs() && Utils.isOptionValid('test')) {
          globalThis.require('nw.gui').Window.get().showDevTools()
        }
        break
      }
    }
  }

  static catchException(e) {
    if (e instanceof Error) {
      Graphics.printError(e.name, e.message)
      console.error(e.stack)
    } else {
      Graphics.printError('UnknownError', e)
    }
    AudioManager.stopAll()
    this.stop()
  }

  static tickStart() {
    Graphics.tickStart()
  }

  static tickEnd() {
    Graphics.tickEnd()
  }

  static updateInputData() {
    Input.update()
    TouchInput.update()
  }

  static updateMain() {
    if (Utils.isMobileSafari()) {
      this.changeScene()
      this.updateScene()
    } else {
      // TODO PIXI.Ticker
      const newTime = this._getTimeInMsWithoutMobileSafari()
      let fTime = (newTime - this._currentTime) / 1000
      if (fTime > 0.25) fTime = 0.25
      this._currentTime = newTime
      this._accumulator += fTime
      while (this._accumulator >= this._deltaTime) {
        this.updateInputData()
        this.changeScene()
        this.updateScene()
        this._accumulator -= this._deltaTime
      }
    }
    this.renderScene()
    this.requestUpdate()
  }

  static updateManagers() {
    ImageManager.update()
  }

  static changeScene() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
      if (this._scene) {
        this._scene.terminate()
        this._scene.detachReservation()
        this._previousClass = this._scene.constructor as (new() => Scene_Base)
      }
      this._scene = this._nextScene
      if (this._scene) {
        this._scene.attachReservation()
        this._scene.create()
        this._nextScene = null
        this._sceneStarted = false
        this.onSceneCreate()
      }
      if (this._exiting) {
        this.terminate()
      }
    }
  }

  static updateScene() {
    if (this._scene) {
      if (!this._sceneStarted && this._scene.isReady()) {
        this._scene.start()
        this._sceneStarted = true
        this.onSceneStart()
      }
      if (this.isCurrentSceneStarted()) {
        this._scene.update()
      }
    }
  }

  static renderScene() {
    if (this.isCurrentSceneStarted()) {
      Graphics.render(this._scene)
    } else if (this._scene) {
      this.onSceneLoading()
    }
  }

  static onSceneCreate() {
    Graphics.startLoading()
  }

  static onSceneStart() {
    Graphics.endLoading()
  }

  static onSceneLoading() {
    Graphics.updateLoading()
  }

  static isSceneChanging() {
    return this._exiting || !!this._nextScene
  }

  static isCurrentSceneBusy() {
    return !!this._scene?.isBusy()
  }

  static isCurrentSceneStarted() {
    return this._scene && this._sceneStarted
  }

  static isNextScene<T extends Scene_Base>(sceneClass: (new() => T) | null) {
    return this._nextScene && this._nextScene.constructor === sceneClass
  }

  static isPreviousScene<T extends Scene_Base>(sceneClass: (new() => T) | null) {
    return this._previousClass === sceneClass
  }

  static goto<T extends Scene_Base>(sceneClass: (new() => T) | null) {
    if (sceneClass) {
      this._nextScene = new sceneClass()
    }
    if (this._scene) {
      this._scene.stop()
    }
  }

  static push<T extends Scene_Base>(sceneClass: new() => T) {
    this._stack.push(this._scene?.constructor as (new() => Scene_Base))
    this.goto(sceneClass)
  }

  static pop() {
    if (this._stack.length > 0) {
      this.goto(this._stack.pop()!) // length > 0 ????????? undefined
    } else {
      this.exit()
    }
  }

  static exit() {
    this.goto(null) // TODO ?????? null ?????????
    this._exiting = true
  }

  static clearStack() {
    this._stack = []
  }

  static stop() {
    this._stopped = true
  }

  static prepareNextScene(...args) {
    this._nextScene?.prepare(...args)
  }

  static snap() {
    return Bitmap.snap(this._scene)
  }

  static snapForBackground() {
    this._backgroundBitmap = this.snap()
    this._backgroundBitmap.blur()
  }

  static backgroundBitmap() {
    return this._backgroundBitmap
  }

  static resume() {
    this._stopped = false
    this.requestUpdate()
    if (!Utils.isMobileSafari()) {
      this._currentTime = this._getTimeInMsWithoutMobileSafari()
      this._accumulator = 0
    }
  }
}

if (!Utils.isMobileSafari()) {
  SceneManager._currentTime = SceneManager._getTimeInMsWithoutMobileSafari()
}
