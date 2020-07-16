import * as assert from 'assert'
import * as A from '../src/Array'
import { reduceM, intercalate } from '../src/Foldable'
import { monoidString } from '../src/Monoid'
import * as O from '../src/Option'

export const ArrayOptionURI = 'ArrayOption'

export type ArrayOptionURI = typeof ArrayOptionURI

describe('Foldable', () => {
  it('intercalate', () => {
    assert.deepStrictEqual(intercalate(monoidString, A.Foldable)(',', ['a', 'b', 'c']), 'a,b,c')
  })

  it('reduceM', () => {
    assert.deepStrictEqual(
      reduceM(O.Monad, A.Foldable)([], 1, () => O.none),
      O.some(1)
    )
    assert.deepStrictEqual(
      reduceM(O.Monad, A.Foldable)([2], 1, () => O.none),
      O.none
    )
    assert.deepStrictEqual(
      reduceM(O.Monad, A.Foldable)([2], 1, (b, a) => O.some(b + a)),
      O.some(3)
    )
  })
})
