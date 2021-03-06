import {ResourceHandler} from './ResourceHandler'
import {Utils} from './Utils'
import * as PIXI from 'pixi.js'
import {SceneManager} from '../managers/SceneManager'
import {Scene_Base} from '../scenes/Scene_Base'

export class Graphics {
  private static _cssFontLoading = document.fonts && document.fonts.ready
  private static _fontLoaded: FontFaceSet | null = null
  private static _videoVolume = 1

  private static _width: number
  private static _height: number
  private static _rendererType: string
  private static _boxWidth: number
  private static _boxHeight: number
  private static _scale = 1
  private static _realScale = 1

  /**
   * The width of the game screen.
   *
   * @static
   * @property width
   * @type Number
   */
  static get width() {
    return this._width
  }

  static set width(value) {
    if (this._width !== value) {
      this._width = value
      this._updateAllElements()
    }
  }

  /**
   * The height of the game screen.
   *
   * @static
   * @property height
   * @type Number
   */
  static get height() {
    return this._height
  }

  static set height(value) {
    if (this._height !== value) {
      this._height = value
      this._updateAllElements()
    }
  }

  /**
   * The width of the window display area.
   *
   * @static
   * @property boxWidth
   * @type Number
   */
  static get boxWidth() {
    return this._boxWidth
  }

  static set boxWidth(value) {
    this._boxHeight = value
  }

  /**
   * The height of the window display area.
   *
   * @static
   * @property boxHeight
   * @type Number
   */
  static get boxHeight() {
    return this._boxHeight
  }

  static set boxHeight(value) {
    this._boxHeight = value
  }

  /**
   * The zoom scale of the game screen.
   *
   * @static
   * @property scale
   * @type Number
   */
  static get scale() {
    return this._scale
  }

  static set scale(value) {
    if (this._scale !== value) {
      this._scale = value
      this._updateAllElements()
    }
  }

  private static _errorShowed = false
  private static _errorPrinter: HTMLParagraphElement
  private static _canvas: HTMLCanvasElement
  private static _video: HTMLVideoElement
  private static _videoUnlocked = false
  private static _videoLoading = false
  private static _videoLoader: OnErrorEventHandler = null
  private static _upperCanvas: HTMLCanvasElement
  static _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  private static _fpsMeter: any // todo
  private static _modeBox: HTMLDivElement
  private static _skipCount = 0
  private static _maxSkip = 3
  private static _rendered = false
  private static _loadingImage: HTMLImageElement | null = null
  private static _loadingCount = 0
  private static _fpsMeterToggled = false
  private static _stretchEnabled = this._defaultStretchMode()

  private static _canUseDifferenceBlend = false
  private static _canUseSaturationBlend = false
  private static _hiddenCanvas: HTMLCanvasElement | null = null

  static initialize(width = 800, height = 600, type = 'auto') {
    this._width = width
    this._height = height
    this._rendererType = type
    this._boxWidth = this._width
    this._boxHeight = this._height

    this._testCanvasBlendModes()
    this._modifyExistingElements()
    this._updateRealScale()
    this._createAllElements()
    this._disableTextSelection()
    this._disableContextMenu()
    this._setupEventHandlers()
    this._setupCssFontLoading()
  }


  private static _setupCssFontLoading() {
    // @ts-ignore ????????????????????????
    if (Graphics._cssFontLoading) {
      document.fonts.ready.then(function (fonts) {
        Graphics._fontLoaded = fonts
      }).catch(function (error) {
        SceneManager.onError(error)
      })
    }
  }

  static canUseCssFontLoading() {
    return !!this._cssFontLoading
  }

  /**
   * The total frame count of the game screen.
   *
   * @static
   * @property frameCount
   * @type Number
   */
  static frameCount = 0

  /**
   * The alias of PIXI.blendModes.NORMAL.
   *
   * @static
   * @property BLEND_NORMAL
   * @type Number
   * @final
   */
  static BLEND_NORMAL = 0

  /**
   * The alias of PIXI.blendModes.ADD.
   *
   * @static
   * @property BLEND_ADD
   * @type Number
   * @final
   */
  static BLEND_ADD = 1

  /**
   * The alias of PIXI.blendModes.MULTIPLY.
   *
   * @static
   * @property BLEND_MULTIPLY
   * @type Number
   * @final
   */
  static BLEND_MULTIPLY = 2

  /**
   * The alias of PIXI.blendModes.SCREEN.
   *
   * @static
   * @property BLEND_SCREEN
   * @type Number
   * @final
   */
  static BLEND_SCREEN = 3

  /**
   * Marks the beginning of each frame for FPSMeter.
   *
   * @static
   * @method tickStart
   */
  static tickStart() {
    if (this._fpsMeter) {
      this._fpsMeter.tickStart()
    }
  }

  /**
   * Marks the end of each frame for FPSMeter.
   *
   * @static
   * @method tickEnd
   */
  static tickEnd() {
    if (this._fpsMeter && this._rendered) {
      this._fpsMeter.tick()
    }
  }

  /**
   * Renders the stage to the game screen.
   *
   * @static
   * @method render
   * @param {Stage} stage The stage object to be rendered
   */
  static render(stage: Scene_Base | null) {
    if (this._skipCount === 0) {
      const startTime = Date.now()
      if (stage) {
        this._renderer.render(stage)
        if (this._renderer instanceof PIXI.WebGLRenderer) { // changed
          this._renderer.gl.flush()
        }
      }
      const endTime = Date.now()
      const elapsed = endTime - startTime
      this._skipCount = Math.min(Math.floor(elapsed / 15), this._maxSkip)
      this._rendered = true
    } else {
      this._skipCount--
      this._rendered = false
    }
    this.frameCount++
  }

  /**
   * Checks whether the renderer type is WebGL.
   *
   * @static
   * @method isWebGL
   * @return {Boolean} True if the renderer type is WebGL
   */
  static isWebGL() {
    return this._renderer && this._renderer.type === PIXI.RENDERER_TYPE.WEBGL
  }

  /**
   * Checks whether the current browser supports WebGL.
   *
   * @static
   * @method hasWebGL
   * @return {Boolean} True if the current browser supports WebGL.
   */
  static hasWebGL() {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch (e) {
      return false
    }
  }

  /**
   * Checks whether the canvas blend mode 'difference' is supported.
   *
   * @static
   * @method canUseDifferenceBlend
   * @return {Boolean} True if the canvas blend mode 'difference' is supported
   */
  static canUseDifferenceBlend() {
    return this._canUseDifferenceBlend
  }

  /**
   * Checks whether the canvas blend mode 'saturation' is supported.
   *
   * @static
   * @method canUseSaturationBlend
   * @return {Boolean} True if the canvas blend mode 'saturation' is supported
   */
  static canUseSaturationBlend() {
    return this._canUseSaturationBlend
  }

  /**
   * Sets the source of the "Now Loading" image.
   *
   * @static
   * @method setLoadingImage
   */
  static setLoadingImage(src) {
    this._loadingImage = new Image()
    this._loadingImage.src = src
  }

  /**
   * Initializes the counter for displaying the "Now Loading" image.
   *
   * @static
   * @method startLoading
   */
  static startLoading() {
    this._loadingCount = 0
  }

  /**
   * Increments the loading counter and displays the "Now Loading" image if necessary.
   *
   * @static
   * @method updateLoading
   */
  static updateLoading() {
    this._loadingCount++
    this._paintUpperCanvas()
    this._upperCanvas!.style.opacity = '1'
  }

  /**
   * Erases the "Now Loading" image.
   *
   * @static
   * @method endLoading
   */
  static endLoading() {
    this._clearUpperCanvas()
    this._upperCanvas!.style.opacity = '0'
  }

  /**
   * Displays the loading error text to the screen.
   *
   * @static
   * @method printLoadingError
   * @param {String} url The url of the resource failed to load
   */
  static printLoadingError(url) {
    if (this._errorPrinter && !this._errorShowed) {
      this._errorPrinter.innerHTML = this._makeErrorHtml('Loading Error', 'Failed to load: ' + url)
      const button = document.createElement('button')
      button.innerHTML = 'Retry'
      button.style.fontSize = '24px'
      button.style.color = '#ffffff'
      button.style.backgroundColor = '#000000'
      button.onmousedown = button.ontouchstart = function (event: TouchEvent | MouseEvent) {
        ResourceHandler.retry()
        event.stopPropagation()
      }
      this._errorPrinter.appendChild(button)
      this._loadingCount = -Infinity
    }
  }

  /**
   * Erases the loading error text.
   *
   * @static
   * @method eraseLoadingError
   */
  static eraseLoadingError() {
    if (this._errorPrinter && !this._errorShowed) {
      this._errorPrinter.innerHTML = ''
      this.startLoading()
    }
  }

  /**
   * Displays the error text to the screen.
   *
   * @static
   * @method printError
   * @param {String} name The name of the error
   * @param {String} message The message of the error
   */
  static printError(name: string, message: string) {
    this._errorShowed = true
    if (this._errorPrinter) {
      this._errorPrinter.innerHTML = this._makeErrorHtml(name, message)
    }
    this._applyCanvasFilter()
    this._clearUpperCanvas()
  }

  /**
   * Shows the FPSMeter element.
   *
   * @static
   * @method showFps
   */
  static showFps() {
    if (this._fpsMeter) {
      this._fpsMeter.show()
      this._modeBox!.style.opacity = String(1)
    }
  }

  /**
   * Hides the FPSMeter element.
   *
   * @static
   * @method hideFps
   */
  static hideFps() {
    if (this._fpsMeter) {
      this._fpsMeter.hide()
      this._modeBox!.style.opacity = String(0)
    }
  }

  /**
   * Loads a font file.
   *
   * @static
   * @method loadFont
   * @param {String} name The face name of the font
   * @param {String} url The url of the font file
   */
  static loadFont(name: string, url: string) {
    const style = document.createElement('style')
    const head = document.getElementsByTagName('head')
    const rule = '@font-face { font-family: "' + name + '"; src: url("' + url + '"); }'
    style.type = 'text/css'
    head.item(0)!.appendChild(style)
    style.sheet!.insertRule(rule, 0)
    this._createFontLoader(name)
  }

  /**
   * Checks whether the font file is loaded.
   *
   * @static
   * @method isFontLoaded
   * @param {String} name The face name of the font
   * @return {Boolean} True if the font file is loaded
   */
  static isFontLoaded(name: string) {
    // @ts-ignore ????????????????????????
    if (Graphics._cssFontLoading) {
      if (Graphics._fontLoaded) {
        return Graphics._fontLoaded.check('10px "' + name + '"')
      }

      return false
    } else {
      if (!this._hiddenCanvas) {
        this._hiddenCanvas = document.createElement('canvas')
      }
      const context = this._hiddenCanvas.getContext('2d')!
      const text = 'abcdefghijklmnopqrstuvwxyz'
      context.font = '40px ' + name + ', sans-serif'
      const width1 = context.measureText(text).width
      context.font = '40px sans-serif'
      const width2 = context.measureText(text).width
      return width1 !== width2
    }
  }

  /**
   * Starts playback of a video.
   *
   * @static
   * @method playVideo
   * @param {String} src
   */
  static playVideo(src: string) {
    this._videoLoader = ResourceHandler.createLoader(null, this._playVideo.bind(this, src), this._onVideoError.bind(this))
    this._playVideo(src)
  }

  /**
   * @static
   * @method _playVideo
   * @param {String} src
   * @private
   */
  static _playVideo(src: string) {
    this._video.src = src
    this._video.onloadeddata = this._onVideoLoad.bind(this)
    this._video.onerror = this._videoLoader
    this._video.onended = this._onVideoEnd.bind(this)
    this._video.load()
    this._videoLoading = true
  }

  /**
   * Checks whether the video is playing.
   *
   * @static
   * @method isVideoPlaying
   * @return {Boolean} True if the video is playing
   */
  static isVideoPlaying() {
    return this._videoLoading || this._isVideoVisible()
  }

  /**
   * Checks whether the browser can play the specified video type.
   *
   * @static
   * @method canPlayVideoType
   * @param {String} type The video type to test support for
   * @return {Boolean} True if the browser can play the specified video type
   */
  static canPlayVideoType(type: string) {
    return this._video && this._video.canPlayType(type)
  }

  /**
   * Sets volume of a video.
   *
   * @static
   * @method setVideoVolume
   * @param {Number} value
   */
  static setVideoVolume(value: number) {
    this._videoVolume = value
    if (this._video) {
      this._video.volume = this._videoVolume
    }
  }

  /**
   * Converts an x coordinate on the page to the corresponding
   * x coordinate on the canvas area.
   *
   * @static
   * @method pageToCanvasX
   * @param {Number} x The x coordinate on the page to be converted
   * @return {Number} The x coordinate on the canvas area
   */
  static pageToCanvasX(x: number) {
    if (this._canvas) {
      const left = this._canvas.offsetLeft
      return Math.round((x - left) / this._realScale)
    } else {
      return 0
    }
  }

  /**
   * Converts a y coordinate on the page to the corresponding
   * y coordinate on the canvas area.
   *
   * @static
   * @method pageToCanvasY
   * @param {Number} y The y coordinate on the page to be converted
   * @return {Number} The y coordinate on the canvas area
   */
  static pageToCanvasY(y: number) {
    if (this._canvas) {
      const top = this._canvas.offsetTop
      return Math.round((y - top) / this._realScale)
    } else {
      return 0
    }
  }

  /**
   * Checks whether the specified point is inside the game canvas area.
   *
   * @static
   * @method isInsideCanvas
   * @param {Number} x The x coordinate on the canvas area
   * @param {Number} y The y coordinate on the canvas area
   * @return {Boolean} True if the specified point is inside the game canvas area
   */
  static isInsideCanvas(x: number, y: number) {
    return (x >= 0 && x < this._width && y >= 0 && y < this._height)
  }

  /**
   * Calls pixi.js garbage collector
   */
  static callGC() {
    if (Graphics.isWebGL()) {
      (Graphics._renderer as PIXI.WebGLRenderer).textureGC?.run()
    }
  }

  private static _createAllElements() {
    this._createErrorPrinter()
    this._createCanvas()
    this._createVideo()
    this._createUpperCanvas()
    this._createRenderer()
    this._createFPSMeter()
    this._createModeBox()
    this._createGameFontLoader()
  }

  private static _updateAllElements() {
    this._updateRealScale()
    this._updateErrorPrinter()
    this._updateCanvas()
    this._updateVideo()
    this._updateUpperCanvas()
    this._updateRenderer()
    this._paintUpperCanvas()
  }

  private static _updateRealScale() {
    if (this._stretchEnabled) {
      let h = window.innerWidth / this._width
      let v = window.innerHeight / this._height
      if (h >= 1 && h - 0.01 <= 1) h = 1
      if (v >= 1 && v - 0.01 <= 1) v = 1
      this._realScale = Math.min(h, v)
    } else {
      this._realScale = this._scale
    }
  }

  private static _makeErrorHtml(name: string, message: string) {
    return ('<font color="yellow"><b>' + name + '</b></font><br>' +
      '<font color="white">' + message + '</font><br>')
  }

  private static _defaultStretchMode() {
    return Utils.isNwjs() || Utils.isMobileDevice()
  }

  private static _testCanvasBlendModes() {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d')
    if (!context) return
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = 'white'
    context.fillRect(0, 0, 1, 1)
    context.globalCompositeOperation = 'difference'
    context.fillStyle = 'white'
    context.fillRect(0, 0, 1, 1)
    const imageData1 = context.getImageData(0, 0, 1, 1)
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = 'black'
    context.fillRect(0, 0, 1, 1)
    context.globalCompositeOperation = 'saturation'
    context.fillStyle = 'white'
    context.fillRect(0, 0, 1, 1)
    const imageData2 = context.getImageData(0, 0, 1, 1)
    this._canUseDifferenceBlend = imageData1.data[0] === 0
    this._canUseSaturationBlend = imageData2.data[0] === 0
  }

  private static _modifyExistingElements() {
    const elements = document.getElementsByTagName('*')
    for (let i = 0; i < elements.length; i++) {
      const ele = elements[i] as HTMLElement
      if (Number(ele.style.zIndex) > 0) {
        ele.style.zIndex = '0'
      }
    }
  }

  private static _createErrorPrinter() {
    this._errorPrinter = document.createElement('p')
    this._errorPrinter.id = 'ErrorPrinter'
    this._updateErrorPrinter()
    document.body.appendChild(this._errorPrinter)
  }

  private static _updateErrorPrinter() {
    const printer = this._errorPrinter!
    printer.style.textAlign = 'center'
    printer.style.textShadow = '1px 1px 3px #000'
    printer.style.fontSize = '20px'
    printer.style.zIndex = '99'
    this._centerElement(printer, this._width * 0.9, 40)
  }

  private static _createCanvas() {
    this._canvas = document.createElement('canvas')
    this._canvas.id = 'GameCanvas'
    this._updateCanvas()
    document.body.appendChild(this._canvas)
  }

  private static _updateCanvas() {
    const canvas = this._canvas!
    canvas.style.zIndex = '1'
    this._centerElement(canvas, this._width, this._height)
  }

  private static _createVideo() {
    this._video = document.createElement('video')
    this._video.id = 'GameVideo'
    this._video.style.opacity = '0'
    this._video.setAttribute('playsinline', '')
    this._video.volume = this._videoVolume
    this._updateVideo()
    // 3rd lib
    globalThis.makeVideoPlayableInline(this._video)
    document.body.appendChild(this._video)
  }

  private static _updateVideo() {
    const video = this._video!
    video.style.zIndex = '2'
    this._centerElement(video, this._width, this._height)
  }

  private static _createUpperCanvas() {
    this._upperCanvas = document.createElement('canvas')
    this._upperCanvas.id = 'UpperCanvas'
    this._updateUpperCanvas()
    document.body.appendChild(this._upperCanvas)
  }

  private static _updateUpperCanvas() {
    const canvas = this._upperCanvas!
    canvas.style.zIndex = '3'
    this._centerElement(canvas, this._width, this._height)
  }

  private static _clearUpperCanvas() {
    const context = this._upperCanvas?.getContext('2d')
    context?.clearRect(0, 0, this._width, this._height)
  }

  private static _paintUpperCanvas() {
    this._clearUpperCanvas()
    if (this._loadingImage && this._loadingCount >= 20) {
      const context = this._upperCanvas!.getContext('2d')
      const dx = (this._width - this._loadingImage.width) / 2
      const dy = (this._height - this._loadingImage.height) / 2
      const alpha = ((this._loadingCount - 20) / 30).clamp(0, 1)
      if (!context) return
      context.save()
      context.globalAlpha = alpha
      context.drawImage(this._loadingImage, dx, dy)
      context.restore()
    }
  }

  private static _createRenderer() {
    PIXI.utils.skipHello()
    const width = this._width
    const height = this._height
    const options: PIXI.RendererOptions = {view: this._canvas!}
    try {
      switch (this._rendererType) {
      case 'canvas':
        this._renderer = new PIXI.CanvasRenderer(width, height, options)
        break
      case 'webgl':
        this._renderer = new PIXI.WebGLRenderer(width, height, options)
        break
      default:
        this._renderer = PIXI.autoDetectRenderer(width, height, options)
        break
      }

      if (this._renderer instanceof PIXI.WebGLRenderer) // changed
        this._renderer.textureGC!.maxIdle = 1

    } catch (e) {
      // this._renderer = null
    }
  }

  private static _updateRenderer() {
    this._renderer.resize(this._width, this._height)
  }

  private static _createFPSMeter() {
    const options = {graph: 1, decimals: 0, theme: 'transparent', toggleOn: null}
    this._fpsMeter = new FPSMeter(options)
    // @ts-ignore
    this._fpsMeter.hide()
  }

  private static _createModeBox() {
    const box = document.createElement('div')
    box.id = 'modeTextBack'
    box.style.position = 'absolute'
    box.style.left = '5px'
    box.style.top = '5px'
    box.style.width = '119px'
    box.style.height = '58px'
    box.style.background = 'rgba(0,0,0,0.2)'
    box.style.zIndex = '9'
    box.style.opacity = '0'

    const text = document.createElement('div')
    text.id = 'modeText'
    text.style.position = 'absolute'
    text.style.left = '0px'
    text.style.top = '41px'
    text.style.width = '119px'
    text.style.fontSize = '12px'
    text.style.fontFamily = 'monospace'
    text.style.color = 'white'
    text.style.textAlign = 'center'
    text.style.textShadow = '1px 1px 0 rgba(0,0,0,0.5)'
    text.innerHTML = this.isWebGL() ? 'WebGL mode' : 'Canvas mode'

    document.body.appendChild(box)
    box.appendChild(text)

    this._modeBox = box
  }

  private static _createGameFontLoader() {
    this._createFontLoader('GameFont')
  }

  private static _createFontLoader(name: string) {
    const div = document.createElement('div')
    const text = document.createTextNode('.')
    div.style.fontFamily = name
    div.style.fontSize = '0px'
    div.style.color = 'transparent'
    div.style.position = 'absolute'
    div.style.margin = 'auto'
    div.style.top = '0px'
    div.style.left = '0px'
    div.style.width = '1px'
    div.style.height = '1px'
    div.appendChild(text)
    document.body.appendChild(div)
  }

  private static _centerElement(element: HTMLElement, width: number, height: number) {
    const _width = width * this._realScale
    const _height = height * this._realScale
    element.style.position = 'absolute'
    element.style.margin = 'auto'
    element.style.top = '0'
    element.style.left = '0'
    element.style.right = '0'
    element.style.bottom = '0'
    element.style.width = _width + 'px'
    element.style.height = _height + 'px'
  }

  private static _disableTextSelection() {
    const body = document.body
    body.style.userSelect = 'none'
    body.style.webkitUserSelect = 'none'
    // @ts-ignore
    body.style.msUserSelect = 'none'
    // @ts-ignore
    body.style.mozUserSelect = 'none'
  }

  private static _disableContextMenu() {
    const elements = document.body.getElementsByTagName('*')
    const oncontextmenu = function () {
      return false
    }
    for (let i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).oncontextmenu = oncontextmenu
    }
  }

  private static _applyCanvasFilter() {
    if (this._canvas) {
      this._canvas.style.opacity = '0.5'
      this._canvas.style.filter = 'blur(8px)'
      this._canvas.style.webkitFilter = 'blur(8px)'
    }
  }

  private static _onVideoLoad() {
    this._video!.play()
    this._updateVisibility(true)
    this._videoLoading = false
  }

  private static _onVideoError() {
    this._updateVisibility(false)
    this._videoLoading = false
  }

  private static _onVideoEnd() {
    this._updateVisibility(false)
  }

  private static _updateVisibility(videoVisible: boolean) {
    this._video!.style.opacity = String(videoVisible ? 1 : 0)
    this._canvas!.style.opacity = String(videoVisible ? 0 : 1)
  }

  private static _isVideoVisible() {
    return Number(this._video!.style.opacity) > 0
  }

  private static _setupEventHandlers() {
    window.addEventListener('resize', this._onWindowResize.bind(this))
    document.addEventListener('keydown', this._onKeyDown.bind(this))
    document.addEventListener('keydown', this._onTouchEnd.bind(this))
    document.addEventListener('mousedown', this._onTouchEnd.bind(this))
    document.addEventListener('touchend', this._onTouchEnd.bind(this))
  }

  private static _onWindowResize() {
    this._updateAllElements()
  }

  private static _onKeyDown(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.altKey) {
      switch (event.keyCode) {
      case 113:   // F2
        event.preventDefault()
        this._switchFPSMeter()
        break
      case 114:   // F3
        event.preventDefault()
        this._switchStretchMode()
        break
      case 115:   // F4
        event.preventDefault()
        this._switchFullScreen()
        break
      }
    }
  }

  private static _onTouchEnd() {
    if (!this._videoUnlocked) {
      this._video!.play()
      this._videoUnlocked = true
    }
    if (this._isVideoVisible() && this._video!.paused) {
      this._video!.play()
    }
  }

  private static _switchFPSMeter() {
    if (this._fpsMeter.isPaused) {
      this.showFps()
      this._fpsMeter.showFps()
      this._fpsMeterToggled = false
    } else if (!this._fpsMeterToggled) {
      this._fpsMeter.showDuration()
      this._fpsMeterToggled = true
    } else {
      this.hideFps()
    }
  }

  private static _switchStretchMode() {
    this._stretchEnabled = !this._stretchEnabled
    this._updateAllElements()
  }

  private static _switchFullScreen() {
    if (this._isFullScreen()) {
      this._requestFullScreen()
    } else {
      this._cancelFullScreen()
    }
  }

  private static _isFullScreen() {
    // @ts-ignore
    return ((document.fullScreenElement) || (!document.mozFullScreen && !document.webkitFullscreenElement && !document.msFullscreenElement))
  }

  private static _requestFullScreen() {
    const element = document.body
    // @ts-ignore
    if (element.requestFullScreen) {
      // @ts-ignore
      element.requestFullScreen()
      // @ts-ignore
    } else if (element.mozRequestFullScreen) {
      // @ts-ignore
      element.mozRequestFullScreen()
      // @ts-ignore
    } else if (element.webkitRequestFullScreen) {
      // @ts-ignore
      element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
      // @ts-ignore
    } else if (element.msRequestFullscreen) {
      // @ts-ignore
      element.msRequestFullscreen()
    }
  }

  private static _cancelFullScreen() {
    // @ts-ignore
    if (document.cancelFullScreen) {
      // @ts-ignore
      document.cancelFullScreen()
      // @ts-ignore
    } else if (document.mozCancelFullScreen) {
      // @ts-ignore
      document.mozCancelFullScreen()
      // @ts-ignore
    } else if (document.webkitCancelFullScreen) {
      // @ts-ignore
      document.webkitCancelFullScreen()
      // @ts-ignore
    } else if (document.msExitFullscreen) {
      // @ts-ignore
      document.msExitFullscreen()
    }
  }
}
