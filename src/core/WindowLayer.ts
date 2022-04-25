import * as PIXI from 'pixi.js'
import {Graphics} from './Graphics'
import {Window} from './Window'
import {assert, IUpdatable} from '../utils'
import {Rectangle} from './Rectangle'

export class WindowLayer extends PIXI.Container implements IUpdatable {

  static voidFilter = new PIXI.filters.VoidFilter()

  private _width = 0
  private _height = 0
  private _tempCanvas: HTMLCanvasElement | null = null
  private _translationMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  private readonly _windowMask: PIXI.Graphics
  private readonly _windowRect: PIXI.Rectangle
  private _renderSprite = null

  /**
   * The width of the window layer in pixels.
   *
   * @property width
   * @type Number
   */
  // @ts-ignore
  get width() {
    return this._width
  }

  set width(value) {
    this._width = value
  }

  /**
   * The height of the window layer in pixels.
   *
   * @property height
   * @type Number
   */
  // @ts-ignore
  get height() {
    return this._height
  }

  set height(value) {
    this._height = value
  }

  /**
   * The layer which contains game windows.
   *
   * @class WindowLayer
   * @constructor
   */
  constructor() {
    super()
    this._windowMask = new PIXI.Graphics()
    this._windowMask.beginFill(0xffffff, 1)
    this._windowMask.drawRect(0, 0, 0, 0)
    this._windowMask.endFill()
    // @ts-ignore graphicsData is protected
    this._windowRect = this._windowMask.graphicsData[0].shape

    this.filterArea = new PIXI.Rectangle()
    this.filters = [WindowLayer.voidFilter]

    //temporary fix for memory leak bug
    this.on('removed', this.onRemoveAsAChild)
  }

  onRemoveAsAChild() {
    this.removeChildren()
  }

  /**
   * Sets the x, y, width, and height all at once.
   *
   * @method move
   * @param {Number} x The x coordinate of the window layer
   * @param {Number} y The y coordinate of the window layer
   * @param {Number} width The width of the window layer
   * @param {Number} height The height of the window layer
   */
  move(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  /**
   * Updates the window layer for each frame.
   *
   * @method update
   */
  update() {
    this.children.forEach((child) => {
      (child as unknown as IUpdatable).update?.()
    })
  }

  override renderCanvas(renderer: PIXI.CanvasRenderer) {
    if (!this.visible || !this.renderable) {
      return
    }

    if (!this._tempCanvas) {
      this._tempCanvas = document.createElement('canvas')
    }

    this._tempCanvas.width = Graphics.width
    this._tempCanvas.height = Graphics.height

    const realCanvasContext = renderer.context
    const context = this._tempCanvas.getContext('2d')

    assert(context !== null && realCanvasContext !== null)
    context.save()
    context.clearRect(0, 0, Graphics.width, Graphics.height)
    context.beginPath()
    context.rect(this.x, this.y, this.width, this.height)
    context.closePath()
    context.clip()

    renderer.context = context

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if (child instanceof Window && child.visible && child.openness > 0) {
        this._canvasClearWindowRect(renderer, child)
        context.save()
        child.renderCanvas(renderer)
        context.restore()
      }
    }

    context.restore()

    renderer.context = realCanvasContext
    renderer.context.setTransform(1, 0, 0, 1, 0, 0)
    renderer.context.globalCompositeOperation = 'source-over'
    renderer.context.globalAlpha = 1
    renderer.context.drawImage(this._tempCanvas, 0, 0)

    for (let j = 0; j < this.children.length; j++) {
      if (!(this.children[j] instanceof Window)) {
        this.children[j].renderCanvas(renderer)
      }
    }
  }

  private _canvasClearWindowRect(renderSession: PIXI.CanvasRenderer, window: Window) {
    const rx = this.x + window.x
    const ry = this.y + window.y + window.height / 2 * (1 - window.openness / 255)
    const rw = window.width
    const rh = window.height * window.openness / 255
    renderSession.context!.clearRect(rx, ry, rw, rh)
  }

  override renderWebGL(renderer: PIXI.WebGLRenderer) {
    if (!this.visible || !this.renderable) {
      return
    }

    if (this.children.length == 0) {
      return
    }

    renderer.flush()
    this.filterArea.copy(new Rectangle(this.x, this.y, this.width, this.height))
    // @ts-ignore 这里源码里写的是 PIXI.DisplayObject 因此没问题
    renderer.filterManager.pushFilter(this, this.filters)
    renderer.currentRenderer.start()

    const shift = new PIXI.Point()
    const rt = renderer._activeRenderTarget
    const projectionMatrix = rt.projectionMatrix
    shift.x = Math.round((projectionMatrix.tx + 1) / 2 * rt.sourceFrame!.width)
    shift.y = Math.round((projectionMatrix.ty + 1) / 2 * rt.sourceFrame!.height)

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if (child instanceof Window && child.visible && child.openness > 0) {
        this._maskWindow(child, shift)
        // @ts-ignore 这里源码里写的是 PIXI.DisplayObject 因此没问题
        renderer.maskManager.pushScissorMask(this, this._windowMask)
        renderer.clear()
        renderer.maskManager.popScissorMask()
        renderer.currentRenderer.start()
        child.renderWebGL(renderer)
        renderer.currentRenderer.flush()
      }
    }

    renderer.flush()
    renderer.filterManager.popFilter()
    renderer.maskManager.popScissorMask()

    for (let j = 0; j < this.children.length; j++) {
      if (!(this.children[j] instanceof Window)) {
        this.children[j].renderWebGL(renderer)
      }
    }
  }

  private _maskWindow(window: Window, shift: PIXI.Point) {
    // this._windowMask._currentBounds = null
    // @ts-ignore 有点迷惑，先不改
    this._windowMask.boundsDirty = true
    const rect = this._windowRect
    rect.x = this.x + shift.x + window.x
    rect.y = this.x + shift.y + window.y + window.height / 2 * (1 - window.openness / 255)
    rect.width = window.width
    rect.height = window.height * window.openness / 255
  }
}
