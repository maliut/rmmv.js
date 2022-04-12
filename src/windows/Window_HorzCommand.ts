import {Window_Command} from './Window_Command'

// Window_HorzCommand
//
// The command window for the horizontal selection format.
export class Window_HorzCommand extends Window_Command {

  override numVisibleRows() {
    return 1
  }

  override maxCols() {
    return 4
  }

  override itemTextAlign() {
    return 'center'
  }
}
