import * as assert from 'assert'
import * as A from '../src/ReadonlyArray'
import { foldM, intercalate, traverse_ } from '../src/Foldable'
import * as I from '../src/IO'
import { monoidString } from '../src/Monoid'
import * as O from '../src/Option'

export const ArrayOptionURI = 'ArrayOption'

export type ArrayOptionURI = typeof ArrayOptionURI

describe('Foldable', () => {
  it('intercalate', () => {
    assert.deepStrictEqual(intercalate(monoidString, A.Foldable)(',', ['a', 'b', 'c']), 'a,b,c')
  })

  it('traverse_', () => {
    let log = ''
    const append = (s: String) => () => (log += s)
    traverse_(I.Applicative, A.Foldable)(['a', 'b', 'c'], append)()
    assert.deepStrictEqual(log, 'abc')
  })

  it('foldM', () => {
    assert.deepStrictEqual(
      foldM(O.Monad, A.Foldable)([], 1, () => O.none),
      O.some(1)
    )
    assert.deepStrictEqual(
      foldM(O.Monad, A.Foldable)([2], 1, () => O.none),
      O.none
    )
    assert.deepStrictEqual(
      foldM(O.Monad, A.Foldable)([2], 1, (b, a) => O.some(b + a)),
      O.some(3)
    )
  })
})
