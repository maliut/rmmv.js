import * as PIXI from 'pixi.js'
import {Bitmap} from './Bitmap'
import {Rectangle} from './Rectangle'
import {Sprite} from './Sprite'
import {Point} from './Point'

export class TilingSprite extends PIXI.extras.PictureTilingSprite {

  private _bitmap: Bitmap | null = null
  protected override _width = 0
  protected override _height = 0
  private _frame = new Rectangle()
  private spriteId = Sprite._counter++

  /**
   * The origin point of the tiling sprite for scrolling.
   *
   * @property origin
   * @type Point
   */
  private origin = new Point()

  /**
   * The image for the tiling sprite.
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
      if (this._bitmap) {
        this._bitmap.addLoadListener(this._onBitmapLoad.bind(this))
      } else {
        this.texture.frame = Rectangle.emptyRectangle
      }
    }
  }

  /**
   * The opacity of the tiling sprite (0 to 255).
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
   * The sprite object for a tiling image.
   *
   * @class TilingSprite
   * @constructor
   * @param {Bitmap} bitmap The image for the tiling sprite
   */
  constructor(bitmap: Bitmap) {
    super(new PIXI.Texture(new PIXI.BaseTexture()))
    this.bitmap = bitmap
  }

  protected /* override */ _renderCanvas(renderer: PIXI.CanvasRenderer) {
    if (this._bitmap) {
      this._bitmap.touch()
    }
    if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
      super._renderCanvas(renderer)
    }
  }

  protected /* override */ _renderWebGL(renderer: PIXI.WebGLRenderer) {
    // 这里原来居然定义了重复的
    // if (this._bitmap) {
    //   this._bitmap.touch()
    // }
    // if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
    //   if (this._bitmap) {
    //     this._bitmap.checkDirty()
    //   }
    //   super._renderWebGL(renderer)
    // }
    if (this._bitmap) {
      this._bitmap.touch()
      this._bitmap.checkDirty()
    }

    Sprite.prototype._speedUpCustomBlendModes.call(this, renderer)

    super._renderWebGL(renderer)
  }

  /**
   * Updates the tiling sprite for each frame.
   *
   * @method update
   */
  update() {
    this.children.forEach(function (child) {
      // @ts-ignore
      child?.update()
    })
  }

  /**
   * Sets the x, y, width, and height all at once.
   *
   * @method move
   * @param {Number} x The x coordinate of the tiling sprite
   * @param {Number} y The y coordinate of the tiling sprite
   * @param {Number} width The width of the tiling sprite
   * @param {Number} height The height of the tiling sprite
   */
  move(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this._width = width
    this._height = height
  }

  /**
   * Specifies the region of the image that the tiling sprite will use.
   *
   * @method setFrame
   * @param {Number} x The x coordinate of the frame
   * @param {Number} y The y coordinate of the frame
   * @param {Number} width The width of the frame
   * @param {Number} height The height of the frame
   */
  setFrame(x: number, y: number, width: number, height: number) {
    this._frame.x = x
    this._frame.y = y
    this._frame.width = width
    this._frame.height = height
    this._refresh()
  }

  override updateTransform() {
    this.tilePosition.x = Math.round(-this.origin.x)
    this.tilePosition.y = Math.round(-this.origin.y)
    super.updateTransform()
  }

  private _onBitmapLoad() {
    this.texture.baseTexture = this._bitmap.baseTexture
    this._refresh()
  }

  private _refresh() {
    const frame = this._frame.clone()
    if (frame.width === 0 && frame.height === 0 && this._bitmap) {
      frame.width = this._bitmap.width
      frame.height = this._bitmap.height
    }
    this.texture.frame = frame
    // @ts-ignore
    this.texture._updateID++
    // @ts-ignore todo 好像没用
    this.tilingTexture = null
  }
}
