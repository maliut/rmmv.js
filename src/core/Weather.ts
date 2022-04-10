import * as PIXI from 'pixi.js'
import {Graphics} from './Graphics'
import {Point} from './Point'
import {Bitmap} from './Bitmap'
import {ScreenSprite} from './ScreenSprite'
import {Sprite} from './Sprite'

type WeatherType = 'none' | 'rain' | 'storm' | 'snow'

export class Weather extends PIXI.Container {

  private _width = Graphics.width
  private _height = Graphics.height
  private _sprites: Sprite[] = []
  private _rainBitmap: Bitmap | null = null
  private _stormBitmap: Bitmap | null = null
  private _snowBitmap: Bitmap | null = null
  private _dimmerSprite: ScreenSprite | null = null
  viewport?: Bitmap

  /**
   * The type of the weather in ['none', 'rain', 'storm', 'snow'].
   *
   * @property type
   * @type String
   */
  type: WeatherType = 'none'

  /**
   * The power of the weather in the range (0, 9).
   *
   * @property power
   * @type Number
   */
  power = 0

  /**
   * The origin point of the weather for scrolling.
   *
   * @property origin
   * @type Point
   */
  origin = new Point()

  /**
   * The weather effect which displays rain, storm, or snow.
   *
   * @class Weather
   * @constructor
   */
  constructor() {
    super()
    this._createBitmaps()
    this._createDimmer()
  }

  /**
   * Updates the weather for each frame.
   *
   * @method update
   */
  update() {
    this._updateDimmer()
    this._updateAllSprites()
  }

  private _createBitmaps() {
    this._rainBitmap = new Bitmap(1, 60)
    this._rainBitmap.fillAll('white')
    this._stormBitmap = new Bitmap(2, 100)
    this._stormBitmap.fillAll('white')
    this._snowBitmap = new Bitmap(9, 9)
    this._snowBitmap.drawCircle(4, 4, 4, 'white')
  }

  private _createDimmer() {
    this._dimmerSprite = new ScreenSprite()
    this._dimmerSprite.setColor(80, 80, 80)
    this.addChild(this._dimmerSprite)
  }

  private _updateDimmer() {
    this._dimmerSprite.opacity = Math.floor(this.power * 6)
  }

  private _updateAllSprites() {
    const maxSprites = Math.floor(this.power * 10)
    while (this._sprites.length < maxSprites) {
      this._addSprite()
    }
    while (this._sprites.length > maxSprites) {
      this._removeSprite()
    }
    this._sprites.forEach(function (sprite) {
      this._updateSprite(sprite)
      sprite.x = sprite.ax - this.origin.x
      sprite.y = sprite.ay - this.origin.y
    }, this)
  }

  private _addSprite() {
    const sprite = new Sprite(this.viewport)
    sprite.opacity = 0
    this._sprites.push(sprite)
    this.addChild(sprite)
  }

  private _removeSprite() {
    this.removeChild(this._sprites.pop())
  }

  private _updateSprite(sprite: Sprite) {
    switch (this.type) {
    case 'rain':
      this._updateRainSprite(sprite)
      break
    case 'storm':
      this._updateStormSprite(sprite)
      break
    case 'snow':
      this._updateSnowSprite(sprite)
      break
    }
    if (sprite.opacity < 40) {
      this._rebornSprite(sprite)
    }
  }

  private _updateRainSprite(sprite: Sprite) {
    sprite.bitmap = this._rainBitmap
    sprite.rotation = Math.PI / 16
    sprite.ax -= 6 * Math.sin(sprite.rotation)
    sprite.ay += 6 * Math.cos(sprite.rotation)
    sprite.opacity -= 6
  }

  private _updateStormSprite(sprite: Sprite) {
    sprite.bitmap = this._stormBitmap
    sprite.rotation = Math.PI / 8
    sprite.ax -= 8 * Math.sin(sprite.rotation)
    sprite.ay += 8 * Math.cos(sprite.rotation)
    sprite.opacity -= 8
  }

  private _updateSnowSprite(sprite: Sprite) {
    sprite.bitmap = this._snowBitmap
    sprite.rotation = Math.PI / 16
    sprite.ax -= 3 * Math.sin(sprite.rotation)
    sprite.ay += 3 * Math.cos(sprite.rotation)
    sprite.opacity -= 3
  }

  private _rebornSprite(sprite) {
    sprite.ax = Math.randomInt(Graphics.width + 100) - 100 + this.origin.x
    sprite.ay = Math.randomInt(Graphics.height + 200) - 200 + this.origin.y
    sprite.opacity = 160 + Math.randomInt(60)
  }
}