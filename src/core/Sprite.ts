import * as PIXI from 'pixi.js'
import {Rectangle} from './Rectangle'
import {Bitmap} from './Bitmap'
import {Utils} from './Utils'
import {Graphics} from './Graphics'
import {assert, IUpdatable} from '../utils'

/**
 * The basic object that is rendered to the game screen.
 */
export class Sprite extends PIXI.Sprite implements IUpdatable {

  static voidFilter = new PIXI.filters.VoidFilter()

  // Number of the created objects.
  static _counter = 0

  private _bitmap: Bitmap | null = null
  private _frame = new Rectangle()
  private _realFrame = new Rectangle()
  private _blendColor = [0, 0, 0, 0]
  private _colorTone = [0, 0, 0, 0]
  private _canvas: HTMLCanvasElement | null = null
  private _context: CanvasRenderingContext2D | null = null
  private _tintTexture: PIXI.BaseTexture | null = null
  private _refreshFrame = false

  /**
   * use heavy renderer that will reduce border artifacts and apply advanced blendModes
   * @type {boolean}
   * @private
   */
  protected _isPicture = false

  spriteId = Sprite._counter++
  opaque = false

  // Weather 类中临时储存变量
  ax = 0
  ay = 0
  // Sprite_Damage 中临时储存变量
  dy = 0
  ry = 0
  // 临时储存变量？
  z = 0

  /**
   * The image for the sprite.
   *
   * @property bitmap
   * @type Bitmap
   */
  get bitmap() {
    return this._bitmap
  }

  set bitmap(value) {
    if (this._bitmap !== value) {
      this._bitmap = value

      if (value) {
        this._refreshFrame = true
        value.addLoadListener(this._onBitmapLoad.bind(this))
      } else {
        this._refreshFrame = false
        this.texture.frame = Rectangle.emptyRectangle
      }
    }
  }

  /**
   * The width of the sprite without the scale.
   *
   * @property width
   * @type Number
   */
  // @ts-ignore
  get width() {
    return this._frame.width
  }

  set width(value) {
    this._frame.width = value
    this._refresh()
  }

  /**
   * The height of the sprite without the scale.
   *
   * @property height
   * @type Number
   */
  // @ts-ignore
  get height() {
    return this._frame.height
  }

  set height(value) {
    this._frame.height = value
    this._refresh()
  }

  /**
   * The opacity of the sprite (0 to 255).
   *
   * @property opacity
   * @type Number
   */
  get opacity() {
    return this.alpha * 255
  }

  set opacity(value) {
    this.alpha = value.clamp(0, 255) / 255
  }

  /**
   * The basic object that is rendered to the game screen.
   *
   * @class Sprite
   * @constructor
   * @param {Bitmap} bitmap The image for the sprite
   */
  constructor(bitmap: Bitmap | null = null) {
    super(new PIXI.Texture(new PIXI.BaseTexture()))
    this.bitmap = bitmap
  }

  /**
   * Updates the sprite for each frame.
   *
   * @method update
   */
  update() {
    this.children.forEach((child) => {
      (child as unknown as IUpdatable).update?.()
    })
  }

  /**
   * Sets the x and y at once.
   *
   * @method move
   * @param {Number} x The x coordinate of the sprite
   * @param {Number} y The y coordinate of the sprite
   */
  move(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Sets the rectagle of the bitmap that the sprite displays.
   *
   * @method setFrame
   * @param {Number} x The x coordinate of the frame
   * @param {Number} y The y coordinate of the frame
   * @param {Number} width The width of the frame
   * @param {Number} height The height of the frame
   */
  setFrame(x: number, y: number, width: number, height: number) {
    this._refreshFrame = false
    const frame = this._frame
    if (x !== frame.x || y !== frame.y ||
      width !== frame.width || height !== frame.height) {
      frame.x = x
      frame.y = y
      frame.width = width
      frame.height = height
      this._refresh()
    }
  }

  /**
   * Gets the blend color for the sprite.
   *
   * @method getBlendColor
   * @return {Array} The blend color [r, g, b, a]
   */
  getBlendColor(): number[] {
    return this._blendColor.clone()
  }

  /**
   * Sets the blend color for the sprite.
   *
   * @method setBlendColor
   * @param {Array} color The blend color [r, g, b, a]
   */
  setBlendColor(color: number[]) {
    if (!this._blendColor.equals(color)) {
      this._blendColor = color.clone()
      this._refresh()
    }
  }

  /**
   * Gets the color tone for the sprite.
   *
   * @method getColorTone
   * @return {Array} The color tone [r, g, b, gray]
   */
  getColorTone(): number[] {
    return this._colorTone.clone()
  }

  /**
   * Sets the color tone for the sprite.
   *
   * @method setColorTone
   * @param {Array} tone The color tone [r, g, b, gray]
   */
  setColorTone(tone: number[]) {
    if (!this._colorTone.equals(tone)) {
      this._colorTone = tone.clone()
      this._refresh()
    }
  }

  private _onBitmapLoad(bitmapLoaded: Bitmap) {
    if (bitmapLoaded === this._bitmap) {
      if (this._refreshFrame && this._bitmap) {
        this._refreshFrame = false
        this._frame.width = this._bitmap.width
        this._frame.height = this._bitmap.height
      }
    }

    this._refresh()
  }

  private _refresh() {
    const frameX = Math.floor(this._frame.x)
    const frameY = Math.floor(this._frame.y)
    const frameW = Math.floor(this._frame.width)
    const frameH = Math.floor(this._frame.height)
    const bitmapW = this._bitmap ? this._bitmap.width : 0
    const bitmapH = this._bitmap ? this._bitmap.height : 0
    const realX = frameX.clamp(0, bitmapW)
    const realY = frameY.clamp(0, bitmapH)
    const realW = (frameW - realX + frameX).clamp(0, bitmapW - realX)
    const realH = (frameH - realY + frameY).clamp(0, bitmapH - realY)

    this._realFrame.x = realX
    this._realFrame.y = realY
    this._realFrame.width = realW
    this._realFrame.height = realH
    this.pivot.x = frameX - realX
    this.pivot.y = frameY - realY

    if (realW > 0 && realH > 0) {
      if (this._needsTint()) {
        this._createTinter(realW, realH)
        this._executeTint(realX, realY, realW, realH)
        this._tintTexture!.update()
        this.texture.baseTexture = this._tintTexture!
        this.texture.frame = new Rectangle(0, 0, realW, realH)
      } else {
        if (this._bitmap) {
          this.texture.baseTexture = this._bitmap.baseTexture
        }
        this.texture.frame = this._realFrame
      }
    } else if (this._bitmap) {
      this.texture.frame = Rectangle.emptyRectangle
    } else {
      this.texture.baseTexture.width = Math.max(this.texture.baseTexture.width, this._frame.x + this._frame.width)
      this.texture.baseTexture.height = Math.max(this.texture.baseTexture.height, this._frame.y + this._frame.height)
      this.texture.frame = this._frame
    }
    // @ts-ignore
    this.texture._updateID++
  }

  private _isInBitmapRect(x: number, y: number, w: number, h: number) {
    return (this._bitmap && x + w > 0 && y + h > 0 &&
      x < this._bitmap.width && y < this._bitmap.height)
  }

  private _needsTint() {
    const tone = this._colorTone
    return tone[0] || tone[1] || tone[2] || tone[3] || this._blendColor[3] > 0
  }

  private _createTinter(w: number, h: number) {
    if (!this._canvas) {
      this._canvas = document.createElement('canvas')
      this._context = this._canvas.getContext('2d')!
    }

    this._canvas.width = w
    this._canvas.height = h

    if (!this._tintTexture) {
      this._tintTexture = new PIXI.BaseTexture(this._canvas)
    }

    this._tintTexture.width = w
    this._tintTexture.height = h
    this._tintTexture.scaleMode = this._bitmap!.baseTexture.scaleMode
  }

  private _executeTint(x: number, y: number, w: number, h: number) {
    const context = this._context
    const tone = this._colorTone
    const color = this._blendColor

    assert(context !== null)
    context.globalCompositeOperation = 'copy'
    context.drawImage(this._bitmap!.canvas, x, y, w, h, 0, 0, w, h)

    if (Graphics.canUseSaturationBlend()) {
      const gray = Math.max(0, tone[3])
      context.globalCompositeOperation = 'saturation'
      context.fillStyle = 'rgba(255,255,255,' + gray / 255 + ')'
      context.fillRect(0, 0, w, h)
    }

    const r1 = Math.max(0, tone[0])
    const g1 = Math.max(0, tone[1])
    const b1 = Math.max(0, tone[2])
    context.globalCompositeOperation = 'lighter'
    context.fillStyle = Utils.rgbToCssColor(r1, g1, b1)
    context.fillRect(0, 0, w, h)

    if (Graphics.canUseDifferenceBlend()) {
      context.globalCompositeOperation = 'difference'
      context.fillStyle = 'white'
      context.fillRect(0, 0, w, h)

      const r2 = Math.max(0, -tone[0])
      const g2 = Math.max(0, -tone[1])
      const b2 = Math.max(0, -tone[2])
      context.globalCompositeOperation = 'lighter'
      context.fillStyle = Utils.rgbToCssColor(r2, g2, b2)
      context.fillRect(0, 0, w, h)

      context.globalCompositeOperation = 'difference'
      context.fillStyle = 'white'
      context.fillRect(0, 0, w, h)
    }

    const r3 = Math.max(0, color[0])
    const g3 = Math.max(0, color[1])
    const b3 = Math.max(0, color[2])
    const a3 = Math.max(0, color[3])
    context.globalCompositeOperation = 'source-atop'
    context.fillStyle = Utils.rgbToCssColor(r3, g3, b3)
    context.globalAlpha = a3 / 255
    context.fillRect(0, 0, w, h)

    context.globalCompositeOperation = 'destination-in'
    context.globalAlpha = 1
    context.drawImage(this._bitmap!.canvas, x, y, w, h, 0, 0, w, h)
  }

  protected override _renderCanvas(renderer: PIXI.CanvasRenderer) {
    if (this.bitmap) {
      this.bitmap.touch()
    }
    if (this.bitmap && !this.bitmap.isReady()) {
      return
    }

    if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
      super._renderCanvas(renderer)
    }
  }

  _speedUpCustomBlendModes(renderer: PIXI.WebGLRenderer) {
    const picture = renderer.plugins.picture
    const blend = this.blendMode
    if (renderer.renderingToScreen && renderer._activeRenderTarget.root) {
      if (picture.drawModes[blend]) {
        // @ts-ignore
        const stage = renderer._lastObjectRendered
        // @ts-ignore
        const f = stage._filters
        if (!f || !f[0]) {
          setTimeout(function () {
            // @ts-ignore
            const f = stage._filters
            if (!f || !f[0]) {
              stage.filters = [Sprite.voidFilter]
              stage.filterArea = new PIXI.Rectangle(0, 0, Graphics.width, Graphics.height)
            }
          }, 0)
        }
      }
    }
  }

  protected override _renderWebGL(renderer: PIXI.WebGLRenderer) {
    if (this.bitmap) {
      this.bitmap.touch()
    }
    if (this.bitmap && !this.bitmap.isReady()) {
      return
    }
    if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
      if (this._bitmap) {
        this._bitmap.checkDirty()
      }

      //copy of pixi-v4 internal code
      this.calculateVertices()

      if (this.pluginName === 'sprite' && this._isPicture) {
        // use heavy renderer, which reduces artifacts and applies corrent blendMode,
        // but does not use multitexture optimization
        this._speedUpCustomBlendModes(renderer)
        renderer.setObjectRenderer(renderer.plugins.picture)
        renderer.plugins.picture.render(this)
      } else {
        // use pixi super-speed renderer
        renderer.setObjectRenderer(renderer.plugins[this.pluginName])
        renderer.plugins[this.pluginName].render(this)
      }
    }
  }
}
