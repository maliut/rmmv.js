export function assert(condition: any, msg = 'Assertion Error'): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

export interface IUpdatable {
  update()
}
