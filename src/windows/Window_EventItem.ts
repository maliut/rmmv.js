import {Window_ItemList} from './Window_ItemList'
import {Graphics} from '../core/Graphics'
import {DataManager, global} from '../managers/DataManager'
import {Window_Message} from './Window_Message'
import {Data_Item, Data_ItemBase} from '../types/global'

// Window_EventItem
//
// The window used for the event command [Select Item].
export class Window_EventItem extends Window_ItemList {

  private readonly _messageWindow: Window_Message

  constructor(messageWindow: Window_Message) {
    super()
    this._messageWindow = messageWindow
    this.setHandler('ok', this.onOk.bind(this))
    this.setHandler('cancel', this.onCancel.bind(this))
  }

  override initialize() {
    const width = Graphics.boxWidth
    const height = this.windowHeight()
    super.initialize(0, 0, width, height)
    this.openness = 0
    this.deactivate()
    return this
  }

  windowHeight() {
    return this.fittingHeight(this.numVisibleRows())
  }

  numVisibleRows() {
    return 4
  }

  start() {
    this.refresh()
    this.updatePlacement()
    this.select(0)
    this.open()
    this.activate()
  }

  updatePlacement() {
    if (this._messageWindow.y >= Graphics.boxHeight / 2) {
      this.y = 0
    } else {
      this.y = Graphics.boxHeight - this.height
    }
  }

  override includes(item: Data_ItemBase | null) {
    const itypeId = global.$gameMessage.itemChoiceItypeId()
    return DataManager.isItem(item) && (item as Data_Item).itypeId === itypeId
  }

  override isEnabled(item: Data_ItemBase | null) {
    return true
  }

  onOk() {
    const item = this.item()
    const itemId = item ? item.id : 0
    global.$gameVariables.setValue(global.$gameMessage.itemChoiceVariableId(), itemId)
    this._messageWindow.terminateMessage()
    this.close()
  }

  onCancel() {
    global.$gameVariables.setValue(global.$gameMessage.itemChoiceVariableId(), 0)
    this._messageWindow.terminateMessage()
    this.close()
  }
}
