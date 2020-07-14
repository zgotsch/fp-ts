import * as assert from 'assert'
import { pipe } from '../src/function'
import * as _ from '../src/IO'
import { monoidSum } from '../src/Monoid'
import { semigroupSum } from '../src/Semigroup'

describe('IO', () => {
  describe('pipeables', () => {
    it('map', () => {
      const double = (n: number): number => n * 2
      assert.deepStrictEqual(pipe(_.of(1), _.map(double))(), 2)
    })

    it('ap', () => {
      const double = (n: number): number => n * 2
      assert.deepStrictEqual(pipe(_.of(double), _.ap(_.of(1)))(), 2)
    })

    it('apFirst', () => {
      assert.deepStrictEqual(pipe(_.of('a'), _.apFirst(_.of('b')))(), 'a')
    })

    it('apSecond', () => {
      assert.deepStrictEqual(pipe(_.of('a'), _.apSecond(_.of('b')))(), 'b')
    })

    it('chain', () => {
      const f = (n: number) => _.of(n * 2)
      assert.deepStrictEqual(pipe(_.of(1), _.chain(f))(), 2)
    })

    it('flatten', () => {
      assert.deepStrictEqual(pipe(_.of(_.of(1)), _.flatten)(), 1)
    })

    it('chainFirst', () => {
      const f = (n: number) => _.of(n * 2)
      assert.deepStrictEqual(pipe(_.of(1), _.chainFirst(f))(), 1)
    })
  })

  it('getSemigroup', () => {
    const S = _.getSemigroup(semigroupSum)
    // tslint:disable-next-line: readonly-array
    const log: Array<string> = []
    const append = (message: string): _.IO<number> => () => log.push(message)
    assert.deepStrictEqual(S.concat(append('a'), append('b'))(), 3)
    assert.deepStrictEqual(log, ['a', 'b'])
  })

  it('getMonoid', () => {
    const M = _.getMonoid(monoidSum)
    // tslint:disable-next-line: readonly-array
    const log: Array<string> = []
    const append = (message: string): _.IO<number> => () => log.push(message)
    assert.deepStrictEqual(M.concat(append('a'), M.empty)(), 1)
    assert.deepStrictEqual(M.concat(M.empty, append('b'))(), 2)
    assert.deepStrictEqual(log, ['a', 'b'])
  })
})
