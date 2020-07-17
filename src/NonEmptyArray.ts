/**
 * Data structure which represents non-empty arrays
 *
 * @since 2.5.0
 */
import { Alt1 } from './Alt'
import { Applicative1 } from './Applicative'
import { Apply1 } from './Apply'
import { Comonad1 } from './Comonad'
import { Eq } from './Eq'
import { Extend1 } from './Extend'
import { Foldable1 } from './Foldable'
import { FoldableWithIndex1 } from './FoldableWithIndex'
import { Lazy, Predicate, Refinement } from './function'
import { Functor1 } from './Functor'
import { FunctorWithIndex1 } from './FunctorWithIndex'
import { Monad1 } from './Monad'
import { none, Option, some } from './Option'
import { Ord } from './Ord'
import * as A from './Array'
import { ReadonlyRecord } from './Record'
import { getJoinSemigroup, getMeetSemigroup, Semigroup } from './Semigroup'
import { Show } from './Show'
import { PipeableTraverse1, Traversable1 } from './Traversable'
import { PipeableTraverseWithIndex1, TraversableWithIndex1 } from './TraversableWithIndex'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.5.0
 */
export type NonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A
}

/**
 * Append an element to the front of an array, creating a new non empty array
 *
 * @example
 * import { cons } from 'fp-ts/lib/NonEmptyArray'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.deepStrictEqual(pipe([2, 3, 4], cons(1)), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.5.0
 */
export const cons: <A>(head: A) => (tail: ReadonlyArray<A>) => NonEmptyArray<A> = A.cons

/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/lib/NonEmptyArray'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3], snoc(4)), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.5.0
 */
export const snoc: <A>(end: A) => (init: ReadonlyArray<A>) => NonEmptyArray<A> = A.snoc

/**
 * Builds a `ReadonlyNonEmptyArray` from an array returning `none` if `as` is an empty array
 *
 * @category constructors
 * @since 2.5.0
 */
export function fromArray<A>(as: ReadonlyArray<A>): Option<NonEmptyArray<A>> {
  return A.isNonEmpty(as) ? some(as) : none
}

/**
 * @category instances
 * @since 2.5.0
 */
export const getShow: <A>(S: Show<A>) => Show<NonEmptyArray<A>> = A.getShow

/**
 * @since 2.5.0
 */
export function head<A>(nea: NonEmptyArray<A>): A {
  return nea[0]
}

/**
 * @since 2.5.0
 */
export function tail<A>(nea: NonEmptyArray<A>): ReadonlyArray<A> {
  return nea.slice(1)
}

/**
 * @category combinators
 * @since 2.5.0
 */
export const reverse: <A>(nea: NonEmptyArray<A>) => NonEmptyArray<A> = A.reverse as any

/**
 * @since 2.5.0
 */
export function min<A>(ord: Ord<A>): (nea: NonEmptyArray<A>) => A {
  const S = getMeetSemigroup(ord)
  return (nea) => nea.reduce(S.concat)
}

/**
 * @since 2.5.0
 */
export function max<A>(ord: Ord<A>): (nea: NonEmptyArray<A>) => A {
  const S = getJoinSemigroup(ord)
  return (nea) => nea.reduce(S.concat)
}

/**
 * Builds a `Semigroup` instance for `ReadonlyNonEmptyArray`
 *
 * @category instances
 * @since 2.5.0
 */
export function getSemigroup<A = never>(): Semigroup<NonEmptyArray<A>> {
  return {
    concat: concat
  }
}

/**
 * @example
 * import { getEq } from 'fp-ts/lib/NonEmptyArray'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * const E = getEq(eqNumber)
 * assert.strictEqual(E.equals([1, 2], [1, 2]), true)
 * assert.strictEqual(E.equals([1, 2], [1, 3]), false)
 *
 * @category instances
 * @since 2.5.0
 */
export const getEq: <A>(E: Eq<A>) => Eq<NonEmptyArray<A>> = A.getEq

/**
 * Group equal, consecutive elements of an array into non empty arrays.
 *
 * @example
 * import { group } from 'fp-ts/lib/NonEmptyArray'
 * import { ordNumber } from 'fp-ts/lib/Ord'
 *
 * assert.deepStrictEqual(group(ordNumber)([1, 2, 1, 1]), [
 *   [1],
 *   [2],
 *   [1, 1]
 * ])
 *
 * @category combinators
 * @since 2.5.0
 */
export function group<A>(
  E: Eq<A>
): {
  (as: NonEmptyArray<A>): NonEmptyArray<NonEmptyArray<A>>
  (as: ReadonlyArray<A>): ReadonlyArray<NonEmptyArray<A>>
}
export function group<A>(E: Eq<A>): (as: ReadonlyArray<A>) => ReadonlyArray<NonEmptyArray<A>> {
  return (as) => {
    const len = as.length
    if (len === 0) {
      return A.empty
    }
    // tslint:disable-next-line: readonly-array
    const r: Array<NonEmptyArray<A>> = []
    let head: A = as[0]
    // tslint:disable-next-line: readonly-array
    let nea: [A, ...ReadonlyArray<A>] = [head]
    for (let i = 1; i < len; i++) {
      const x = as[i]
      if (E.equals(x, head)) {
        nea.push(x)
      } else {
        r.push(nea)
        head = x
        nea = [head]
      }
    }
    r.push(nea)
    return r
  }
}

/**
 * Sort and then group the elements of an array into non empty arrays.
 *
 * @example
 * import { groupSort } from 'fp-ts/lib/NonEmptyArray'
 * import { ordNumber } from 'fp-ts/lib/Ord'
 *
 * assert.deepStrictEqual(groupSort(ordNumber)([1, 2, 1, 1]), [[1, 1, 1], [2]])
 *
 * @category combinators
 * @since 2.5.0
 */
export function groupSort<A>(O: Ord<A>): (as: ReadonlyArray<A>) => ReadonlyArray<NonEmptyArray<A>> {
  const sortO = A.sort(O)
  const groupO = group(O)
  return (as) => groupO(sortO(as))
}

/**
 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
 * function on each element, and grouping the results according to values returned
 *
 * @example
 * import { groupBy } from 'fp-ts/lib/NonEmptyArray'
 *
 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['foo', 'bar', 'foobar']), {
 *   '3': ['foo', 'bar'],
 *   '6': ['foobar']
 * })
 *
 * @category constructors
 * @since 2.5.0
 */
export function groupBy<A>(f: (a: A) => string): (as: ReadonlyArray<A>) => ReadonlyRecord<string, NonEmptyArray<A>> {
  return (as) => {
    // tslint:disable-next-line: readonly-array
    const r: Record<string, [A, ...ReadonlyArray<A>]> = {}
    for (const a of as) {
      const k = f(a)
      if (r.hasOwnProperty(k)) {
        r[k].push(a)
      } else {
        r[k] = [a]
      }
    }
    return r
  }
}

/**
 * @since 2.5.0
 */
export function last<A>(nea: NonEmptyArray<A>): A {
  return nea[nea.length - 1]
}

/**
 * Get all but the last element of a non empty array, creating a new array.
 *
 * @example
 * import { init } from 'fp-ts/lib/NonEmptyArray'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
 * assert.deepStrictEqual(init([1]), [])
 *
 * @since 2.5.0
 */
export function init<A>(nea: NonEmptyArray<A>): ReadonlyArray<A> {
  return nea.slice(0, -1)
}

/**
 * @category combinators
 * @since 2.5.0
 */
export function sort<A>(O: Ord<A>): (nea: NonEmptyArray<A>) => NonEmptyArray<A> {
  return A.sort(O) as any
}

/**
 * @since 2.5.0
 */
export function insertAt<A>(i: number, a: A): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>> {
  return A.insertAt(i, a) as any
}

/**
 * @since 2.5.0
 */
export function updateAt<A>(i: number, a: A): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>> {
  return A.updateAt(i, a) as any
}

/**
 * @since 2.5.0
 */
export function modifyAt<A>(i: number, f: (a: A) => A): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>> {
  return A.modifyAt(i, f) as any
}

/**
 * @since 2.5.0
 */
export function filter<A, B extends A>(
  refinement: Refinement<A, B>
): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>>
export function filter<A>(predicate: Predicate<A>): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>>
export function filter<A>(predicate: Predicate<A>): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>> {
  return filterWithIndex((_, a) => predicate(a))
}

/**
 * @since 2.5.0
 */
export function filterWithIndex<A>(
  predicate: (i: number, a: A) => boolean
): (nea: NonEmptyArray<A>) => Option<NonEmptyArray<A>> {
  return (nea) => fromArray(nea.filter((a, i) => predicate(i, a)))
}

/**
 * @category Applicative
 * @since 2.5.0
 */
export const of: <A>(a: A) => NonEmptyArray<A> = A.of as any

/**
 * @category constructors
 * @since 2.5.0
 */
export function concat<A>(fx: ReadonlyArray<A>, fy: NonEmptyArray<A>): NonEmptyArray<A>
export function concat<A>(fx: NonEmptyArray<A>, fy: ReadonlyArray<A>): NonEmptyArray<A>
export function concat<A>(fx: ReadonlyArray<A>, fy: ReadonlyArray<A>): ReadonlyArray<A> {
  return fx.concat(fy)
}

/**
 * @since 2.5.0
 */
export function fold<A>(S: Semigroup<A>): (fa: NonEmptyArray<A>) => A {
  return (fa) => fa.reduce(S.concat)
}

/**
 * @category combinators
 * @since 2.5.1
 */
export const zipWith: <A, B, C>(
  fa: NonEmptyArray<A>,
  fb: NonEmptyArray<B>,
  f: (a: A, b: B) => C
) => NonEmptyArray<C> = A.zipWith as any

/**
 * @category combinators
 * @since 2.5.1
 */
export const zip: {
  <B>(bs: NonEmptyArray<B>): <A>(as: NonEmptyArray<A>) => NonEmptyArray<readonly [A, B]>
  <A, B>(as: NonEmptyArray<A>, bs: NonEmptyArray<B>): NonEmptyArray<readonly [A, B]>
} = A.zip as any

/**
 * @since 2.5.1
 */
export const unzip: <A, B>(
  as: NonEmptyArray<readonly [A, B]>
) => readonly [NonEmptyArray<A>, NonEmptyArray<B>] = A.unzip as any

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const mapWithIndex_: FunctorWithIndex1<URI, number>['mapWithIndex'] = A.FunctorWithIndex.mapWithIndex as any
const ap_: Apply1<URI>['ap'] = A.Applicative.ap as any
const chain_: Monad1<URI>['chain'] = A.Monad.chain as any
const extend_: Extend1<URI>['extend'] = A.Extend.extend as any
const reduce_: Foldable1<URI>['reduce'] = A.Foldable.reduce as any
const foldMap_: Foldable1<URI>['foldMap'] = A.Foldable.foldMap as any
const reduceRight_: Foldable1<URI>['reduceRight'] = A.Foldable.reduceRight as any
const traverse_: Traversable1<URI>['traverse'] = A.Traversable.traverse as any
const alt_: Alt1<URI>['alt'] = A.Alt.alt as any
const reduceWithIndex_: FoldableWithIndex1<URI, number>['reduceWithIndex'] = A.FoldableWithIndex.reduceWithIndex as any
const foldMapWithIndex_: FoldableWithIndex1<URI, number>['foldMapWithIndex'] = A.FoldableWithIndex
  .foldMapWithIndex as any
const reduceRightWithIndex_: FoldableWithIndex1<URI, number>['reduceRightWithIndex'] = A.FoldableWithIndex
  .reduceRightWithIndex as any
const traverseWithIndex_: TraversableWithIndex1<URI, number>['traverseWithIndex'] = A.TraversableWithIndex
  .traverseWithIndex as any

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
export const foldMapWithIndex = <S>(S: Semigroup<S>) => <A>(f: (i: number, a: A) => S) => (fa: NonEmptyArray<A>) =>
  fa.slice(1).reduce((s, a, i) => S.concat(s, f(i + 1, a)), f(0, fa[0]))

/**
 * @category Foldable
 * @since 2.5.0
 */
export const foldMap = <S>(S: Semigroup<S>) => <A>(f: (a: A) => S) => (fa: NonEmptyArray<A>) =>
  fa.slice(1).reduce((s, a) => S.concat(s, f(a)), f(fa[0]))

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.6.2
 */
export const alt: <A>(that: Lazy<NonEmptyArray<A>>) => (fa: NonEmptyArray<A>) => NonEmptyArray<A> = A.alt as any

/**
 * @category Apply
 * @since 2.5.0
 */
export const ap: <A>(fa: NonEmptyArray<A>) => <B>(fab: NonEmptyArray<(a: A) => B>) => NonEmptyArray<B> = A.ap as any

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.5.0
 */
export const apFirst: <B>(fb: NonEmptyArray<B>) => <A>(fa: NonEmptyArray<A>) => NonEmptyArray<A> = A.apFirst as any

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.5.0
 */
export const apSecond: <B>(fb: NonEmptyArray<B>) => <A>(fa: NonEmptyArray<A>) => NonEmptyArray<B> = A.apSecond as any

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.5.0
 */
export const chain: <A, B>(f: (a: A) => NonEmptyArray<B>) => (ma: NonEmptyArray<A>) => NonEmptyArray<B> = A.chain as any

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.5.0
 */
export const chainFirst: <A, B>(
  f: (a: A) => NonEmptyArray<B>
) => (ma: NonEmptyArray<A>) => NonEmptyArray<A> = A.chainFirst as any

/**
 * @category Extend
 * @since 2.5.0
 */
export const duplicate: <A>(ma: NonEmptyArray<A>) => NonEmptyArray<NonEmptyArray<A>> = A.duplicate as any

/**
 * @category Extend
 * @since 2.5.0
 */
export const extend: <A, B>(
  f: (fa: NonEmptyArray<A>) => B
) => (ma: NonEmptyArray<A>) => NonEmptyArray<B> = A.extend as any

/**
 * @category Monad
 * @since 2.5.0
 */
export const flatten: <A>(mma: NonEmptyArray<NonEmptyArray<A>>) => NonEmptyArray<A> = A.flatten as any

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
export const map: Functor1<URI>['map'] = A.map as any

/**
 * @category FunctorWithIndex
 * @since 2.5.0
 */
export const mapWithIndex: <A, B>(
  f: (i: number, a: A) => B
) => (fa: NonEmptyArray<A>) => NonEmptyArray<B> = A.mapWithIndex as any

/**
 * @category Foldable
 * @since 2.5.0
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (fa: NonEmptyArray<A>) => B = A.reduce

/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
export const reduceWithIndex: <A, B>(b: B, f: (i: number, b: B, a: A) => B) => (fa: NonEmptyArray<A>) => B =
  A.reduceWithIndex

/**
 * @category Foldable
 * @since 2.5.0
 */
export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => (fa: NonEmptyArray<A>) => B = A.reduceRight

/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
export const reduceRightWithIndex: <A, B>(b: B, f: (i: number, a: A, b: B) => B) => (fa: NonEmptyArray<A>) => B =
  A.reduceRightWithIndex

/**
 * @since 2.6.3
 */
export const traverse: PipeableTraverse1<URI> = A.traverse as any

/**
 * @since 2.6.3
 */
export const sequence: Traversable1<URI>['sequence'] = A.sequence as any

/**
 * @since 2.6.3
 */
export const traverseWithIndex: PipeableTraverseWithIndex1<URI, number> = A.traverseWithIndex as any

/**
 * @since 2.6.3
 */
export const extract: Comonad1<URI>['extract'] = head

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.5.0
 */
export const URI = 'NonEmptyArray'

/**
 * @category instances
 * @since 2.5.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: NonEmptyArray<A>
  }
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Functor: Functor1<URI> = {
  URI,
  map
}

/**
 * @category instances
 * @since 2.7.0
 */
export const FunctorWithIndex: FunctorWithIndex1<URI, number> = {
  URI,
  map,
  mapWithIndex: mapWithIndex_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Applicative: Applicative1<URI> = {
  URI,
  map,
  ap: ap_,
  of
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Monad: Monad1<URI> = {
  URI,
  map,
  ap: ap_,
  of,
  chain: chain_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Foldable: Foldable1<URI> = {
  URI,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const FoldableWithIndex: FoldableWithIndex1<URI, number> = {
  URI,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  reduceWithIndex: reduceWithIndex_,
  foldMapWithIndex: foldMapWithIndex_,
  reduceRightWithIndex: reduceRightWithIndex_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Traversable: Traversable1<URI> = {
  URI,
  map,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence
}

/**
 * @category instances
 * @since 2.7.0
 */
export const TraversableWithIndex: TraversableWithIndex1<URI, number> = {
  URI,
  map,
  mapWithIndex: mapWithIndex_,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence,
  reduceWithIndex: reduceWithIndex_,
  foldMapWithIndex: foldMapWithIndex_,
  reduceRightWithIndex: reduceRightWithIndex_,
  traverseWithIndex: traverseWithIndex_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Alt: Alt1<URI> = {
  URI,
  map,
  alt: alt_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Comonad: Comonad1<URI> = {
  URI,
  map,
  extend: extend_,
  extract
}

// TODO: remove instance in v3
/**
 * @category instances
 * @since 2.5.0
 */
export const readonlyNonEmptyArray: Monad1<URI> &
  Comonad1<URI> &
  TraversableWithIndex1<URI, number> &
  FunctorWithIndex1<URI, number> &
  FoldableWithIndex1<URI, number> &
  Alt1<URI> = {
  URI,
  of,
  map,
  mapWithIndex: mapWithIndex_,
  ap: ap_,
  chain: chain_,
  extend: extend_,
  extract: extract,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence,
  reduceWithIndex: reduceWithIndex_,
  foldMapWithIndex: foldMapWithIndex_,
  reduceRightWithIndex: reduceRightWithIndex_,
  traverseWithIndex: traverseWithIndex_,
  alt: alt_
}
