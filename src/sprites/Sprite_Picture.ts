import {Sprite} from '../core/Sprite'
import {ImageManager} from '../managers/ImageManager'
import {global} from '../managers/DataManager'

// Sprite_Picture
//
// The sprite for displaying a picture.
export class Sprite_Picture extends Sprite {

  private readonly _pictureId: number
  protected _isPicture = true
  private _pictureName = ''

  constructor(pictureId: number) {
    super()
    this._pictureId = pictureId
    this.update()
  }

  picture() {
    return global.$gameScreen.picture(this._pictureId)
  }

  override update() {
    super.update()
    this.updateBitmap()
    if (this.visible) {
      this.updateOrigin()
      this.updatePosition()
      this.updateScale()
      this.updateTone()
      this.updateOther()
    }
  }

  updateBitmap() {
    const picture = this.picture()
    if (picture) {
      const pictureName = picture.name()
      if (this._pictureName !== pictureName) {
        this._pictureName = pictureName
        this.loadBitmap()
      }
      this.visible = true
    } else {
      this._pictureName = ''
      this.bitmap = null
      this.visible = false
    }
  }

  updateOrigin() {
    const picture = this.picture()
    if (picture?.origin() === 0) {
      this.anchor.x = 0
      this.anchor.y = 0
    } else {
      this.anchor.x = 0.5
      this.anchor.y = 0.5
    }
  }

  updatePosition() {
    const picture = this.picture()
    if (picture) {
      this.x = Math.floor(picture.x())
      this.y = Math.floor(picture.y())
    }
  }

  updateScale() {
    const picture = this.picture()
    if (picture) {
      this.scale.x = picture.scaleX() / 100
      this.scale.y = picture.scaleY() / 100
    }
  }

  updateTone() {
    const picture = this.picture()
    if (picture && picture.tone()) {
      this.setColorTone(picture.tone()!)
    } else {
      this.setColorTone([0, 0, 0, 0])
    }
  }

  updateOther() {
    const picture = this.picture()
    if (picture) {
      this.opacity = picture.opacity()
      this.blendMode = picture.blendMode()
      this.rotation = picture.angle() * Math.PI / 180
    }
  }

  loadBitmap() {
    this.bitmap = ImageManager.loadPicture(this._pictureName)
  }
}
