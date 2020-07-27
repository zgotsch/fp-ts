import * as assert from 'assert'
import * as A from '../src/Array'
import * as _ from '../src/Foldable'
import { monoidString } from '../src/Monoid'
import * as O from '../src/Option'
import * as T from '../src/Tree'

export const ArrayOptionURI = 'ArrayOption'

export type ArrayOptionURI = typeof ArrayOptionURI

describe('Foldable', () => {
  it('intercalate', () => {
    assert.deepStrictEqual(_.intercalate(monoidString, A.Foldable)(',', ['a', 'b', 'c']), 'a,b,c')
  })

  it('reduceM', () => {
    assert.deepStrictEqual(
      _.reduceM(O.Monad, A.Foldable)([], 1, () => O.none),
      O.some(1)
    )
    assert.deepStrictEqual(
      _.reduceM(O.Monad, A.Foldable)([2], 1, () => O.none),
      O.none
    )
    assert.deepStrictEqual(
      _.reduceM(O.Monad, A.Foldable)([2], 1, (b, a) => O.some(b + a)),
      O.some(3)
    )
  })

  it('toArray', () => {
    // Option
    const optionToArray = _.toArray(O.Foldable)
    assert.deepStrictEqual(optionToArray(O.some(1)), [1])
    assert.deepStrictEqual(optionToArray(O.none), [])

    // Tree
    const treeToArray = _.toArray(T.Foldable)
    assert.deepStrictEqual(treeToArray(T.make(1, [T.make(2, []), T.make(3, []), T.make(4, [])])), [1, 2, 3, 4])
  })
})
