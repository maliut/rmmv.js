import {Spriteset_Base} from './Spriteset_Base'
import {global} from '../managers/DataManager'
import {Graphics} from '../core/Graphics'
import {TilingSprite} from '../core/TilingSprite'
import {ShaderTilemap} from '../core/ShaderTilemap'
import {Tilemap} from '../core/Tilemap'
import {ImageManager} from '../managers/ImageManager'
import {Sprite_Character} from './Sprite_Character'
import {Sprite} from '../core/Sprite'
import {Sprite_Destination} from './Sprite_Destination'
import {Weather} from '../core/Weather'
import {Data_Tileset} from '../types/global'

// Spriteset_Map
//
// The set of sprites on the map screen.
export class Spriteset_Map extends Spriteset_Base {

  private _characterSprites!: Sprite_Character[]
  private _parallax!: TilingSprite
  private _tilemap!: Tilemap
  private _tileset!: Data_Tileset
  private _shadowSprite!: Sprite
  private _destinationSprite!: Sprite_Destination
  private _weather!: Weather
  private _parallaxName = ''

  override createLowerLayer() {
    super.createLowerLayer()
    this.createParallax()
    this.createTilemap()
    this.createCharacters()
    this.createShadow()
    this.createDestination()
    this.createWeather()
  }

  override update() {
    super.update()
    this.updateTileset()
    this.updateParallax()
    this.updateTilemap()
    this.updateShadow()
    this.updateWeather()
  }

  hideCharacters() {
    for (let i = 0; i < this._characterSprites.length; i++) {
      const sprite = this._characterSprites[i]
      if (!sprite.isTile()) {
        sprite.hide()
      }
    }
  }

  createParallax() {
    this._parallax = new TilingSprite()
    this._parallax.move(0, 0, Graphics.width, Graphics.height)
    this._baseSprite.addChild(this._parallax)
  }

  createTilemap() {
    if (Graphics.isWebGL()) {
      this._tilemap = new ShaderTilemap()
    } else {
      this._tilemap = new Tilemap()
    }
    this._tilemap.tileWidth = global.$gameMap.tileWidth()
    this._tilemap.tileHeight = global.$gameMap.tileHeight()
    this._tilemap.setData(global.$gameMap.width(), global.$gameMap.height(), global.$gameMap.data())
    this._tilemap.horizontalWrap = global.$gameMap.isLoopHorizontal()
    this._tilemap.verticalWrap = global.$gameMap.isLoopVertical()
    this.loadTileset()
    this._baseSprite.addChild(this._tilemap)
  }

  loadTileset() {
    this._tileset = global.$gameMap.tileset()
    if (this._tileset) {
      const tilesetNames = this._tileset.tilesetNames
      for (let i = 0; i < tilesetNames.length; i++) {
        this._tilemap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i])
      }
      const newTilesetFlags = global.$gameMap.tilesetFlags()
      this._tilemap.refreshTileset()
      if (!this._tilemap.flags.equals(newTilesetFlags)) {
        this._tilemap.refresh()
      }
      this._tilemap.flags = newTilesetFlags
    }
  }

  createCharacters() {
    this._characterSprites = []
    global.$gameMap.events().forEach((event) => {
      this._characterSprites.push(new Sprite_Character(event))
    })
    global.$gameMap.vehicles().forEach((vehicle) => {
      this._characterSprites.push(new Sprite_Character(vehicle))
    })
    global.$gamePlayer.followers().reverseEach((follower) => {
      this._characterSprites.push(new Sprite_Character(follower))
    })
    this._characterSprites.push(new Sprite_Character(global.$gamePlayer))
    for (let i = 0; i < this._characterSprites.length; i++) {
      this._tilemap.addChild(this._characterSprites[i])
    }
  }

  createShadow() {
    this._shadowSprite = new Sprite()
    this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow1')
    this._shadowSprite.anchor.x = 0.5
    this._shadowSprite.anchor.y = 1
    this._shadowSprite.z = 6
    this._tilemap.addChild(this._shadowSprite)
  }

  createDestination() {
    this._destinationSprite = new Sprite_Destination()
    this._destinationSprite.z = 9
    this._tilemap.addChild(this._destinationSprite)
  }

  createWeather() {
    this._weather = new Weather()
    this.addChild(this._weather)
  }

  updateTileset() {
    if (this._tileset !== global.$gameMap.tileset()) {
      this.loadTileset()
    }
  }

  /*
   * Simple fix for canvas parallax issue, destroy old parallax and readd to  the tree.
   */
  private _canvasReAddParallax() {
    const index = this._baseSprite.children.indexOf(this._parallax)
    this._baseSprite.removeChild(this._parallax)
    this._parallax = new TilingSprite()
    this._parallax.move(0, 0, Graphics.width, Graphics.height)
    this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName)
    this._baseSprite.addChildAt(this._parallax, index)
  }

  updateParallax() {
    if (this._parallaxName !== global.$gameMap.parallaxName()) {
      this._parallaxName = global.$gameMap.parallaxName()

      if (this._parallax.bitmap && !Graphics.isWebGL()) {
        this._canvasReAddParallax()
      } else {
        this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName)
      }
    }
    if (this._parallax.bitmap) {
      this._parallax.origin.x = global.$gameMap.parallaxOx()
      this._parallax.origin.y = global.$gameMap.parallaxOy()
    }
  }

  updateTilemap() {
    this._tilemap.origin.x = global.$gameMap.displayX() * global.$gameMap.tileWidth()
    this._tilemap.origin.y = global.$gameMap.displayY() * global.$gameMap.tileHeight()
  }

  updateShadow() {
    const airship = global.$gameMap.airship()
    this._shadowSprite.x = airship.shadowX()
    this._shadowSprite.y = airship.shadowY()
    this._shadowSprite.opacity = airship.shadowOpacity()
  }

  updateWeather() {
    this._weather.type = global.$gameScreen.weatherType()
    this._weather.power = global.$gameScreen.weatherPower()
    this._weather.origin.x = global.$gameMap.displayX() * global.$gameMap.tileWidth()
    this._weather.origin.y = global.$gameMap.displayY() * global.$gameMap.tileHeight()
  }
}
