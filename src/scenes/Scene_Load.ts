import {Scene_File} from './Scene_File'
import {TextManager} from '../managers/TextManager'
import {DataManager} from '../managers/DataManager'
import {SoundManager} from '../managers/SoundManager'
import {SceneManager} from '../managers/SceneManager'
import {Scene_Map} from './Scene_Map'
import {global} from '../managers/DataManager'

// Scene_Load
//
// The scene class of the load screen.
export class Scene_Load extends Scene_File {

  private _loadSuccess = false

  override terminate() {
    super.terminate()
    if (this._loadSuccess) {
      global.$gameSystem.onAfterLoad()
    }
  }

  override mode() {
    return 'load'
  }

  override helpWindowText() {
    return TextManager.loadMessage
  }

  override firstSavefileIndex() {
    return DataManager.latestSavefileId() - 1
  }

  override onSavefileOk() {
    super.onSavefileOk()
    if (DataManager.loadGame(this.savefileId())) {
      this.onLoadSuccess()
    } else {
      this.onLoadFailure()
    }
  }

  onLoadSuccess() {
    SoundManager.playLoad()
    this.fadeOutAll()
    this.reloadMapIfUpdated()
    SceneManager.goto(Scene_Map)
    this._loadSuccess = true
  }

  onLoadFailure() {
    SoundManager.playBuzzer()
    this.activateListWindow()
  }

  reloadMapIfUpdated() {
    if (global.$gameSystem.versionId() !== global.$dataSystem.versionId) {
      global.$gamePlayer.reserveTransfer(global.$gameMap.mapId(), global.$gamePlayer.x, global.$gamePlayer.y)
      global.$gamePlayer.requestMapReload()
    }
  }
}
