import * as PIXI from 'pixi.js'
import {Rectangle} from './Rectangle'
import {Point} from './Point'
import {Bitmap} from './Bitmap'
import {Sprite} from './Sprite'
import {assert, IUpdatable} from '../utils'

export class Window extends PIXI.Container implements IUpdatable {

  private _windowskin: Bitmap | null = null
  private _width = 0
  private _height = 0
  private _cursorRect = new Rectangle()
  private _openness = 255
  private _animationCount = 0

  private _padding = 18
  private _margin = 4
  private _colorTone = [0, 0, 0]

  private readonly _windowSpriteContainer: PIXI.Container
  private readonly _windowBackSprite: Sprite
  private readonly _windowCursorSprite: Sprite
  private readonly _windowFrameSprite: Sprite
  private readonly _windowContentsSprite: Sprite
  private _windowArrowSprites = []
  private readonly _windowPauseSignSprite: Sprite
  private readonly _upArrowSprite: Sprite
  private readonly _downArrowSprite: Sprite

  /**
   * The origin point of the window for scrolling.
   *
   * @property origin
   * @type Point
   */
  origin = new Point()

  /**
   * The active state for the window.
   *
   * @property active
   * @type Boolean
   */
  active = true

  /**
   * The visibility of the down scroll arrow.
   *
   * @property downArrowVisible
   * @type Boolean
   */
  downArrowVisible = false

  /**
   * The visibility of the up scroll arrow.
   *
   * @property upArrowVisible
   * @type Boolean
   */
  upArrowVisible = false

  /**
   * The visibility of the pause sign.
   *
   * @property pause
   * @type Boolean
   */
  pause = false

  /**
   * The image used as a window skin.
   *
   * @property windowskin
   * @type Bitmap
   */
  get windowskin() {
    return this._windowskin
  }

  set windowskin(value) {
    if (this._windowskin !== value) {
      this._windowskin = value
      this._windowskin?.addLoadListener(this._onWindowskinLoad.bind(this))
    }
  }

  /**
   * The bitmap used for the window contents.
   *
   * @property contents
   * @type Bitmap
   */
  get contents() {
    const bitmap = this._windowContentsSprite.bitmap
    assert(bitmap !== null, 'called before window initialize')
    return bitmap
  }

  set contents(value) {
    this._windowContentsSprite.bitmap = value
  }

  /**
   * The width of the window in pixels.
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
    this._refreshAllParts()
  }

  /**
   * The height of the window in pixels.
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
    this._refreshAllParts()
  }

  /**
   * The size of the padding between the frame and contents.
   *
   * @property padding
   * @type Number
   */
  get padding() {
    return this._padding
  }

  set padding(value) {
    this._padding = value
    this._refreshAllParts()
  }

  /**
   * The size of the margin for the window background.
   *
   * @property margin
   * @type Number
   */
  get margin() {
    return this._margin
  }

  set margin(value) {
    this._margin = value
    this._refreshAllParts()
  }

  /**
   * The opacity of the window without contents (0 to 255).
   *
   * @property opacity
   * @type Number
   */
  get opacity() {
    return this._windowSpriteContainer.alpha * 255
  }

  set opacity(value) {
    this._windowSpriteContainer.alpha = value.clamp(0, 255) / 255
  }

  /**
   * The opacity of the window background (0 to 255).
   *
   * @property backOpacity
   * @type Number
   */
  get backOpacity() {
    return this._windowBackSprite.alpha * 255
  }

  set backOpacity(value) {
    this._windowBackSprite.alpha = value.clamp(0, 255) / 255
  }

  /**
   * The opacity of the window contents (0 to 255).
   *
   * @property contentsOpacity
   * @type Number
   */
  get contentsOpacity() {
    return this._windowContentsSprite.alpha * 255
  }

  set contentsOpacity(value) {
    this._windowContentsSprite.alpha = value.clamp(0, 255) / 255
  }

  /**
   * The openness of the window (0 to 255).
   *
   * @property openness
   * @type Number
   */
  get openness() {
    return this._openness
  }

  set openness(value) {
    if (this._openness !== value) {
      this._openness = value.clamp(0, 255)
      this._windowSpriteContainer.scale.y = this._openness / 255
      this._windowSpriteContainer.y = this.height / 2 * (1 - this._openness / 255)
    }
  }

  /**
   * The window in the game.
   *
   * @class Window
   * @constructor
   */
  constructor() {
    super()
    this._windowSpriteContainer = new PIXI.Container()
    this._windowBackSprite = new Sprite()
    this._windowCursorSprite = new Sprite()
    this._windowFrameSprite = new Sprite()
    this._windowContentsSprite = new Sprite()
    this._downArrowSprite = new Sprite()
    this._upArrowSprite = new Sprite()
    this._windowPauseSignSprite = new Sprite()
    this._windowBackSprite.bitmap = new Bitmap(1, 1)
    this._windowBackSprite.alpha = 192 / 255
    this.addChild(this._windowSpriteContainer)
    this._windowSpriteContainer.addChild(this._windowBackSprite)
    this._windowSpriteContainer.addChild(this._windowFrameSprite)
    this.addChild(this._windowCursorSprite)
    this.addChild(this._windowContentsSprite)
    this.addChild(this._downArrowSprite)
    this.addChild(this._upArrowSprite)
    this.addChild(this._windowPauseSignSprite)
  }

  /**
   * Updates the window for each frame.
   *
   * @method update
   */
  update() {
    if (this.active) {
      this._animationCount++
    }
    this.children.forEach((child) => {
      (child as unknown as IUpdatable).update?.()
    })
  }

  /**
   * Sets the x, y, width, and height all at once.
   *
   * @method move
   * @param {Number} x The x coordinate of the window
   * @param {Number} y The y coordinate of the window
   * @param {Number} width The width of the window
   * @param {Number} height The height of the window
   */
  move(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    if (this._width !== width || this._height !== height) {
      this._width = width
      this._height = height
      this._refreshAllParts()
    }
  }

  /**
   * Returns true if the window is completely open (openness == 255).
   *
   * @method isOpen
   */
  isOpen() {
    return this._openness >= 255
  }

  /**
   * Returns true if the window is completely closed (openness == 0).
   *
   * @method isClosed
   */
  isClosed() {
    return this._openness <= 0
  }

  /**
   * Sets the position of the command cursor.
   *
   * @method setCursorRect
   * @param {Number} x The x coordinate of the cursor
   * @param {Number} y The y coordinate of the cursor
   * @param {Number} width The width of the cursor
   * @param {Number} height The height of the cursor
   */
  setCursorRect(x = 0, y = 0, width = 0, height = 0) {
    const cx = Math.floor(x)
    const cy = Math.floor(y)
    const cw = Math.floor(width)
    const ch = Math.floor(height)
    const rect = this._cursorRect
    if (rect.x !== cx || rect.y !== cy || rect.width !== cw || rect.height !== ch) {
      this._cursorRect.x = cx
      this._cursorRect.y = cy
      this._cursorRect.width = cw
      this._cursorRect.height = ch
      this._refreshCursor()
    }
  }

  /**
   * Changes the color of the background.
   *
   * @method setTone
   * @param {Number} r The red value in the range (-255, 255)
   * @param {Number} g The green value in the range (-255, 255)
   * @param {Number} b The blue value in the range (-255, 255)
   */
  setTone(r: number, g: number, b: number) {
    const tone = this._colorTone
    if (r !== tone[0] || g !== tone[1] || b !== tone[2]) {
      this._colorTone = [r, g, b]
      this._refreshBack()
    }
  }

  /**
   * Adds a child between the background and contents.
   *
   * @method addChildToBack
   * @param {Object} child The child to add
   * @return {Object} The child that was added
   */
  addChildToBack<T extends PIXI.DisplayObject>(child: T) {
    const containerIndex = this.children.indexOf(this._windowSpriteContainer)
    return this.addChildAt(child, containerIndex + 1)
  }

  override updateTransform() {
    this._updateCursor()
    this._updateArrows()
    this._updatePauseSign()
    this._updateContents()
    super.updateTransform()
  }

  private _onWindowskinLoad() {
    this._refreshAllParts()
  }

  private _refreshAllParts() {
    this._refreshBack()
    this._refreshFrame()
    this._refreshCursor()
    this._refreshContents()
    this._refreshArrows()
    this._refreshPauseSign()
  }

  private _refreshBack() {
    const m = this._margin
    const w = this._width - m * 2
    const h = this._height - m * 2
    const bitmap = new Bitmap(w, h)

    this._windowBackSprite.bitmap = bitmap
    this._windowBackSprite.setFrame(0, 0, w, h)
    this._windowBackSprite.move(m, m)

    if (w > 0 && h > 0 && this._windowskin) {
      const p = 96
      bitmap.blt(this._windowskin, 0, 0, p, p, 0, 0, w, h)
      for (let y = 0; y < h; y += p) {
        for (let x = 0; x < w; x += p) {
          bitmap.blt(this._windowskin, 0, p, p, p, x, y, p, p)
        }
      }
      const tone = this._colorTone
      bitmap.adjustTone(tone[0], tone[1], tone[2])
    }
  }

  private _refreshFrame() {
    const w = this._width
    const h = this._height
    const m = 24
    const bitmap = new Bitmap(w, h)

    this._windowFrameSprite.bitmap = bitmap
    this._windowFrameSprite.setFrame(0, 0, w, h)

    if (w > 0 && h > 0 && this._windowskin) {
      const skin = this._windowskin
      const p = 96
      const q = 96
      bitmap.blt(skin, p + m, 0 + 0, p - m * 2, m, m, 0, w - m * 2, m)
      bitmap.blt(skin, p + m, 0 + q - m, p - m * 2, m, m, h - m, w - m * 2, m)
      bitmap.blt(skin, p + 0, 0 + m, m, p - m * 2, 0, m, m, h - m * 2)
      bitmap.blt(skin, p + q - m, 0 + m, m, p - m * 2, w - m, m, m, h - m * 2)
      bitmap.blt(skin, p + 0, 0 + 0, m, m, 0, 0, m, m)
      bitmap.blt(skin, p + q - m, 0 + 0, m, m, w - m, 0, m, m)
      bitmap.blt(skin, p + 0, 0 + q - m, m, m, 0, h - m, m, m)
      bitmap.blt(skin, p + q - m, 0 + q - m, m, m, w - m, h - m, m, m)
    }
  }

  private _refreshCursor() {
    const pad = this._padding
    const x = this._cursorRect.x + pad - this.origin.x
    const y = this._cursorRect.y + pad - this.origin.y
    const w = this._cursorRect.width
    const h = this._cursorRect.height
    const m = 4
    const x2 = Math.max(x, pad)
    const y2 = Math.max(y, pad)
    const ox = x - x2
    const oy = y - y2
    const w2 = Math.min(w, this._width - pad - x2)
    const h2 = Math.min(h, this._height - pad - y2)
    const bitmap = new Bitmap(w2, h2)

    this._windowCursorSprite.bitmap = bitmap
    this._windowCursorSprite.setFrame(0, 0, w2, h2)
    this._windowCursorSprite.move(x2, y2)

    if (w > 0 && h > 0 && this._windowskin) {
      const skin = this._windowskin
      const p = 96
      const q = 48
      bitmap.blt(skin, p + m, p + m, q - m * 2, q - m * 2, ox + m, oy + m, w - m * 2, h - m * 2)
      bitmap.blt(skin, p + m, p + 0, q - m * 2, m, ox + m, oy + 0, w - m * 2, m)
      bitmap.blt(skin, p + m, p + q - m, q - m * 2, m, ox + m, oy + h - m, w - m * 2, m)
      bitmap.blt(skin, p + 0, p + m, m, q - m * 2, ox + 0, oy + m, m, h - m * 2)
      bitmap.blt(skin, p + q - m, p + m, m, q - m * 2, ox + w - m, oy + m, m, h - m * 2)
      bitmap.blt(skin, p + 0, p + 0, m, m, ox + 0, oy + 0, m, m)
      bitmap.blt(skin, p + q - m, p + 0, m, m, ox + w - m, oy + 0, m, m)
      bitmap.blt(skin, p + 0, p + q - m, m, m, ox + 0, oy + h - m, m, m)
      bitmap.blt(skin, p + q - m, p + q - m, m, m, ox + w - m, oy + h - m, m, m)
    }
  }

  private _refreshContents() {
    this._windowContentsSprite.move(this.padding, this.padding)
  }

  private _refreshArrows() {
    const w = this._width
    const h = this._height
    const p = 24
    const q = p / 2
    const sx = 96 + p
    const sy = 0 + p
    this._downArrowSprite.bitmap = this._windowskin
    this._downArrowSprite.anchor.x = 0.5
    this._downArrowSprite.anchor.y = 0.5
    this._downArrowSprite.setFrame(sx + q, sy + q + p, p, q)
    this._downArrowSprite.move(w / 2, h - q)
    this._upArrowSprite.bitmap = this._windowskin
    this._upArrowSprite.anchor.x = 0.5
    this._upArrowSprite.anchor.y = 0.5
    this._upArrowSprite.setFrame(sx + q, sy, p, q)
    this._upArrowSprite.move(w / 2, q)
  }

  private _refreshPauseSign() {
    const sx = 144
    const sy = 96
    const p = 24
    this._windowPauseSignSprite.bitmap = this._windowskin
    this._windowPauseSignSprite.anchor.x = 0.5
    this._windowPauseSignSprite.anchor.y = 1
    this._windowPauseSignSprite.move(this._width / 2, this._height)
    this._windowPauseSignSprite.setFrame(sx, sy, p, p)
    this._windowPauseSignSprite.alpha = 0
  }

  private _updateCursor() {
    const blinkCount = this._animationCount % 40
    let cursorOpacity = this.contentsOpacity
    if (this.active) {
      if (blinkCount < 20) {
        cursorOpacity -= blinkCount * 8
      } else {
        cursorOpacity -= (40 - blinkCount) * 8
      }
    }
    this._windowCursorSprite.alpha = cursorOpacity / 255
    this._windowCursorSprite.visible = this.isOpen()
  }

  private _updateContents() {
    const w = this._width - this._padding * 2
    const h = this._height - this._padding * 2
    if (w > 0 && h > 0) {
      this._windowContentsSprite.setFrame(this.origin.x, this.origin.y, w, h)
      this._windowContentsSprite.visible = this.isOpen()
    } else {
      this._windowContentsSprite.visible = false
    }
  }

  private _updateArrows() {
    this._downArrowSprite.visible = this.isOpen() && this.downArrowVisible
    this._upArrowSprite.visible = this.isOpen() && this.upArrowVisible
  }

  private _updatePauseSign() {
    const sprite = this._windowPauseSignSprite
    const x = Math.floor(this._animationCount / 16) % 2
    const y = Math.floor(this._animationCount / 16 / 2) % 2
    const sx = 144
    const sy = 96
    const p = 24
    if (!this.pause) {
      sprite.alpha = 0
    } else if (sprite.alpha < 1) {
      sprite.alpha = Math.min(sprite.alpha + 0.1, 1)
    }
    sprite.setFrame(sx + x * p, sy + y * p, p, p)
    sprite.visible = this.isOpen()
  }
}
