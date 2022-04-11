import {Scene_File} from './Scene_File'
import {TextManager} from '../managers/TextManager'
import {DataManager} from '../managers/DataManager'
import {SoundManager} from '../managers/SoundManager'
import {StorageManager} from '../managers/StorageManager'
import {global} from '../managers/DataManager'

// Scene_Save
//
// The scene class of the save screen.
export class Scene_Save extends Scene_File {

  override mode() {
    return 'save'
  }

  override helpWindowText() {
    return TextManager.saveMessage
  }

  override firstSavefileIndex() {
    return DataManager.lastAccessedSavefileId() - 1
  }

  override onSavefileOk() {
    super.onSavefileOk()
    global.$gameSystem.onBeforeSave()
    if (DataManager.saveGame(this.savefileId())) {
      this.onSaveSuccess()
    } else {
      this.onSaveFailure()
    }
  }

  onSaveSuccess() {
    SoundManager.playSave()
    StorageManager.cleanBackup(this.savefileId())
    this.popScene()
  }

  onSaveFailure() {
    SoundManager.playBuzzer()
    this.activateListWindow()
  }
}
