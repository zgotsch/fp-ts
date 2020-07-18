/**
 * ```ts
 * type Option<A> = None | Some<A>
 * ```
 *
 * `Option<A>` is a container for an optional value of type `A`. If the value of type `A` is present, the `Option<A>` is
 * an instance of `Some<A>`, containing the present value of type `A`. If the value is absent, the `Option<A>` is an
 * instance of `None`.
 *
 * An option could be looked at as a collection or foldable structure with either one or zero elements.
 * Another way to look at `Option` is: it represents the effect of a possibly failing computation.
 *
 * @since 2.0.0
 */
import { Alt1 } from './Alt'
import { Alternative1 } from './Alternative'
import { Applicative as ApplicativeHKT, Applicative1 } from './Applicative'
import { Compactable1, Separated } from './Compactable'
import { Either } from './Either'
import { Eq } from './Eq'
import { Extend1 } from './Extend'
import { Filterable1 } from './Filterable'
import { Foldable1 } from './Foldable'
import { identity, Lazy, Predicate, Refinement, pipe, flow } from './function'
import { Functor1 } from './Functor'
import { HKT } from './HKT'
import { Monad1 } from './Monad'
import { MonadThrow1 } from './MonadThrow'
import { Monoid } from './Monoid'
import { Ord } from './Ord'
import { Semigroup } from './Semigroup'
import { Show } from './Show'
import { PipeableTraverse1, Traversable1 } from './Traversable'
import { PipeableWilt1, PipeableWither1, Witherable1 } from './Witherable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 2.0.0
 */
export interface None {
  readonly _tag: 'None'
}

/**
 * @category model
 * @since 2.0.0
 */
export interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

/**
 * @category model
 * @since 2.0.0
 */
export type Option<A> = None | Some<A>

// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------

/**
 * Returns `true` if the option is an instance of `Some`, `false` otherwise
 *
 * @example
 * import { some, none, isSome } from 'fp-ts/lib/Option'
 *
 * assert.strictEqual(isSome(some(1)), true)
 * assert.strictEqual(isSome(none), false)
 *
 * @category guards
 * @since 2.0.0
 */
export const isSome = <A>(fa: Option<A>): fa is Some<A> => fa._tag === 'Some'

/**
 * Returns `true` if the option is `None`, `false` otherwise
 *
 * @example
 * import { some, none, isNone } from 'fp-ts/lib/Option'
 *
 * assert.strictEqual(isNone(some(1)), false)
 * assert.strictEqual(isNone(none), true)
 *
 * @category guards
 * @since 2.0.0
 */
export const isNone = <A>(fa: Option<A>): fa is None => fa._tag === 'None'

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.0.0
 */
export const none: Option<never> = { _tag: 'None' }

/**
 * @category constructors
 * @since 2.0.0
 */
export const some = <A>(a: A): Option<A> => ({ _tag: 'Some', value: a })

/**
 * Constructs a new `Option` from a nullable type. If the value is `null` or `undefined`, returns `None`, otherwise
 * returns the value wrapped in a `Some`
 *
 * @example
 * import { none, some, fromNullable } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(fromNullable(undefined), none)
 * assert.deepStrictEqual(fromNullable(null), none)
 * assert.deepStrictEqual(fromNullable(1), some(1))
 *
 * @category constructors
 * @since 2.0.0
 */
export function fromNullable<A>(a: A): Option<NonNullable<A>> {
  return a == null ? none : some(a as NonNullable<A>)
}

/**
 * Returns a smart constructor based on the given predicate
 *
 * @example
 * import { none, some, fromPredicate } from 'fp-ts/lib/Option'
 *
 * const getOption = fromPredicate((n: number) => n >= 0)
 *
 * assert.deepStrictEqual(getOption(-1), none)
 * assert.deepStrictEqual(getOption(1), some(1))
 *
 * @category constructors
 * @since 2.0.0
 */
export function fromPredicate<A, B extends A>(refinement: Refinement<A, B>): (a: A) => Option<B>
export function fromPredicate<A>(predicate: Predicate<A>): (a: A) => Option<A>
export function fromPredicate<A>(predicate: Predicate<A>): (a: A) => Option<A> {
  return (a) => (predicate(a) ? some(a) : none)
}

/**
 * Transforms an exception into an `Option`. If `f` throws, returns `None`, otherwise returns the output wrapped in
 * `Some`
 *
 * @example
 * import { none, some, tryCatch } from 'fp-ts/lib/Option'
 *
 * assert.deepStrictEqual(
 *   tryCatch(() => {
 *     throw new Error()
 *   }),
 *   none
 * )
 * assert.deepStrictEqual(tryCatch(() => 1), some(1))
 *
 * @category constructors
 * @since 2.0.0
 */
export function tryCatch<A>(f: Lazy<A>): Option<A> {
  try {
    return some(f())
  } catch (e) {
    return none
  }
}

/**
 * Returns an `E` value if possible
 *
 * @category constructors
 * @since 2.0.0
 */
export function getLeft<E, A>(ma: Either<E, A>): Option<E> {
  return ma._tag === 'Right' ? none : some(ma.left)
}

/**
 * Returns an `A` value if possible
 *
 * @category constructors
 * @since 2.0.0
 */
export function getRight<E, A>(ma: Either<E, A>): Option<A> {
  return ma._tag === 'Left' ? none : some(ma.right)
}

/**
 * @category constructors
 * @since 2.0.0
 */
export const fromEither: <E, A>(ma: Either<E, A>) => Option<A> = (ma) => (ma._tag === 'Left' ? none : some(ma.right))

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * Takes a default value, a function, and an `Option` value, if the `Option` value is `None` the default value is
 * returned, otherwise the function is applied to the value inside the `Some` and the result is returned.
 *
 * @example
 * import { some, none, fold } from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     fold(() => 'a none', a => `a some containing ${a}`)
 *   ),
 *   'a some containing 1'
 * )
 *
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     fold(() => 'a none', a => `a some containing ${a}`)
 *   ),
 *   'a none'
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
export function fold<A, B>(onNone: Lazy<B>, onSome: (a: A) => B): (ma: Option<A>) => B {
  return (ma) => (isNone(ma) ? onNone() : onSome(ma.value))
}

/**
 * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
 *
 * @example
 * import { some, none, toNullable } from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     toNullable
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     toNullable
 *   ),
 *   null
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
export function toNullable<A>(ma: Option<A>): A | null {
  return isNone(ma) ? null : ma.value
}

/**
 * Extracts the value out of the structure, if it exists. Otherwise returns `undefined`.
 *
 * @example
 * import { some, none, toUndefined } from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     toUndefined
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     toUndefined
 *   ),
 *   undefined
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
export function toUndefined<A>(ma: Option<A>): A | undefined {
  return isNone(ma) ? undefined : ma.value
}

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export const getOrElseW = <B>(onNone: Lazy<B>) => <A>(ma: Option<A>): A | B => (isNone(ma) ? onNone() : ma.value)

/**
 * Extracts the value out of the structure, if it exists. Otherwise returns the given default value
 *
 * @example
 * import { some, none, getOrElse } from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     getOrElse(() => 0)
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     getOrElse(() => 0)
 *   ),
 *   0
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
export const getOrElse: <A>(onNone: Lazy<A>) => (ma: Option<A>) => A = getOrElseW

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * This is `chain` + `fromNullable`, useful when working with optional values
 *
 * @example
 * import { some, none, fromNullable, mapNullable } from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * interface Employee {
 *   company?: {
 *     address?: {
 *       street?: {
 *         name?: string
 *       }
 *     }
 *   }
 * }
 *
 * const employee1: Employee = { company: { address: { street: { name: 'high street' } } } }
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     fromNullable(employee1.company),
 *     mapNullable(company => company.address),
 *     mapNullable(address => address.street),
 *     mapNullable(street => street.name)
 *   ),
 *   some('high street')
 * )
 *
 * const employee2: Employee = { company: { address: { street: {} } } }
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     fromNullable(employee2.company),
 *     mapNullable(company => company.address),
 *     mapNullable(address => address.street),
 *     mapNullable(street => street.name)
 *   ),
 *   none
 * )
 *
 * @category combinators
 * @since 2.0.0
 */
export function mapNullable<A, B>(f: (a: A) => B | null | undefined): (ma: Option<A>) => Option<B> {
  return (ma) => (isNone(ma) ? none : fromNullable(f(ma.value)))
}

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const chain_: Monad1<URI>['chain'] = (ma, f) => (isNone(ma) ? none : f(ma.value))
const traverse_ = <F>(F: ApplicativeHKT<F>) => <A, B>(ta: Option<A>, f: (a: A) => HKT<F, B>): HKT<F, Option<B>> =>
  isNone(ta) ? F.of(none) : pipe(f(ta.value), F.map(some))
const alt_: Alt1<URI>['alt'] = (fa, that) => (isNone(fa) ? that() : fa)
const filter_ = <A>(fa: Option<A>, predicate: Predicate<A>): Option<A> =>
  isNone(fa) ? none : predicate(fa.value) ? fa : none
const filterMap_: Filterable1<URI>['filterMap'] = (ma, f) => (isNone(ma) ? none : f(ma.value))
const extend_: Extend1<URI>['extend'] = (wa, f) => (isNone(wa) ? none : some(f(wa)))
const partition_ = <A>(fa: Option<A>, predicate: Predicate<A>): Separated<Option<A>, Option<A>> => {
  return {
    left: filter_(fa, (a) => !predicate(a)),
    right: filter_(fa, predicate)
  }
}
const partitionMap_: Filterable1<URI>['partitionMap'] = (fa, f) => separate(pipe(fa, map(f)))
const wither_ = <F>(F: ApplicativeHKT<F>) => <A, B>(fa: Option<A>, f: (a: A) => HKT<F, Option<B>>): HKT<F, Option<B>> =>
  isNone(fa) ? F.of(none) : f(fa.value)
const wilt_ = <F>(F: ApplicativeHKT<F>) => <A, B, C>(
  fa: Option<A>,
  f: (a: A) => HKT<F, Either<B, C>>
): HKT<F, Separated<Option<B>, Option<C>>> => {
  const o = pipe(
    fa,
    map((a) =>
      pipe(
        f(a),
        F.map((e) => ({
          left: getLeft(e),
          right: getRight(e)
        }))
      )
    )
  )
  return isNone(o)
    ? F.of({
        left: none,
        right: none
      })
    : o.value
}
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 2.0.0
 */
export const map: Functor1<URI>['map'] = (f) => (fa) => (isNone(fa) ? none : some(f(fa.value)))

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export const ap: Applicative1<URI>['ap'] = (fa) => (fab) =>
  isNone(fab) ? none : isNone(fa) ? none : some(fab.value(fa.value))

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
export const apFirst: <B>(fb: Option<B>) => <A>(fa: Option<A>) => Option<A> = (fb) =>
  flow(
    map((a) => () => a),
    ap(fb)
  )

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
export const apSecond = <B>(fb: Option<B>): (<A>(fa: Option<A>) => Option<B>) =>
  flow(
    map(() => (b: B) => b),
    ap(fb)
  )

/**
 * @category Applicative
 * @since 2.7.0
 */
export const of: Applicative1<URI>['of'] = some

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export const chain: <A, B>(f: (a: A) => Option<B>) => (ma: Option<A>) => Option<B> = (f) => (ma) => chain_(ma, f)

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
export const chainFirst: <A, B>(f: (a: A) => Option<B>) => (ma: Option<A>) => Option<A> = (f) => (ma) =>
  chain_(ma, (a) =>
    pipe(
      f(a),
      map(() => a)
    )
  )

/**
 * @category Monad
 * @since 2.0.0
 */
export const flatten: <A>(mma: Option<Option<A>>) => Option<A> = (mma) => chain_(mma, identity)

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * In case of `Option` returns the left-most non-`None` value.
 *
 * @example
 * import * as O from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     O.some('a'),
 *     O.alt(() => O.some('b'))
 *   ),
 *   O.some('a')
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     O.none,
 *     O.alt(() => O.some('b'))
 *   ),
 *   O.some('b')
 * )
 *
 * @category Alt
 * @since 2.0.0
 */
export const alt: <A>(that: Lazy<Option<A>>) => (fa: Option<A>) => Option<A> = (that) => (fa) => alt_(fa, that)

/**
 * @category Alternative
 * @since 2.7.0
 */
export const zero: Alternative1<URI>['zero'] = () => none

/**
 * @category MonadThrow
 * @since 2.7.0
 */
export const throwError: MonadThrow1<URI>['throwError'] = () => none

/**
 * @category Extend
 * @since 2.0.0
 */
export const duplicate: <A>(ma: Option<A>) => Option<Option<A>> = (wa) => extend_(wa, identity)

/**
 * @category Extend
 * @since 2.0.0
 */
export const extend: <A, B>(f: (wa: Option<A>) => B) => (wa: Option<A>) => Option<B> = (f) => (ma) => extend_(ma, f)

/**
 * @category Foldable
 * @since 2.0.0
 */
export const reduce: Foldable1<URI>['reduce'] = (b, f) => (fa) => (isNone(fa) ? b : f(b, fa.value))

/**
 * @category Foldable
 * @since 2.0.0
 */
export const foldMap: Foldable1<URI>['foldMap'] = (M) => (f) => (fa) => (isNone(fa) ? M.empty : f(fa.value))

/**
 * @category Foldable
 * @since 2.0.0
 */
export const reduceRight: Foldable1<URI>['reduceRight'] = (b, f) => (fa) => (isNone(fa) ? b : f(fa.value, b))

/**
 * @category Compactable
 * @since 2.0.0
 */
export const compact: <A>(fa: Option<Option<A>>) => Option<A> = flatten

const defaultSeparate = { left: none, right: none }

/**
 * @category Compactable
 * @since 2.0.0
 */
export const separate: <A, B>(ma: Option<Either<A, B>>) => Separated<Option<A>, Option<B>> = (ma) => {
  const o = pipe(
    ma,
    map((e) => ({
      left: getLeft(e),
      right: getRight(e)
    }))
  )
  return isNone(o) ? defaultSeparate : o.value
}

/**
 * @category Filterable
 * @since 2.0.0
 */
export const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (fa: Option<A>) => Option<B>
  <A>(predicate: Predicate<A>): (fa: Option<A>) => Option<A>
} = <A>(predicate: Predicate<A>) => (fa: Option<A>) => filter_(fa, predicate)

/**
 * @category Filterable
 * @since 2.0.0
 */
export const filterMap: <A, B>(f: (a: A) => Option<B>) => (fa: Option<A>) => Option<B> = (f) => (fa) =>
  filterMap_(fa, f)

/**
 * @category Filterable
 * @since 2.0.0
 */
export const partition: {
  <A, B extends A>(refinement: Refinement<A, B>): (fa: Option<A>) => Separated<Option<A>, Option<B>>
  <A>(predicate: Predicate<A>): (fa: Option<A>) => Separated<Option<A>, Option<A>>
} = <A>(predicate: Predicate<A>) => (fa: Option<A>) => partition_(fa, predicate)

/**
 * @category Filterable
 * @since 2.0.0
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => Either<B, C>
) => (fa: Option<A>) => Separated<Option<B>, Option<C>> = (f) => (fa) => partitionMap_(fa, f)

/**
 * @category Traversable
 * @since 2.6.3
 */
export const traverse: PipeableTraverse1<URI> = <F>(
  F: ApplicativeHKT<F>
): (<A, B>(f: (a: A) => HKT<F, B>) => (ta: Option<A>) => HKT<F, Option<B>>) => {
  const traverseF = traverse_(F)
  return (f) => (ta) => traverseF(ta, f)
}

/**
 * @category Traversable
 * @since 2.6.3
 */
export const sequence: Traversable1<URI>['sequence'] = <F>(F: ApplicativeHKT<F>) => <A>(
  ta: Option<HKT<F, A>>
): HKT<F, Option<A>> => (isNone(ta) ? F.of(none) : pipe(ta.value, F.map(some)))

/**
 * @category Whitherable
 * @since 2.6.5
 */
export const wither: PipeableWither1<URI> = <F>(
  F: ApplicativeHKT<F>
): (<A, B>(f: (a: A) => HKT<F, Option<B>>) => (ta: Option<A>) => HKT<F, Option<B>>) => {
  const witherF = wither_(F)
  return (f) => (ta) => witherF(ta, f)
}

/**
 * @category Whitherable
 * @since 2.6.5
 */
export const wilt: PipeableWilt1<URI> = <F>(
  F: ApplicativeHKT<F>
): (<A, B, C>(f: (a: A) => HKT<F, Either<B, C>>) => (wa: Option<A>) => HKT<F, Separated<Option<B>, Option<C>>>) => {
  const wiltF = wilt_(F)
  return (f) => (ta) => wiltF(ta, f)
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.0.0
 */
export const URI = 'Option'

/**
 * @category instances
 * @since 2.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind<A> {
    readonly [URI]: Option<A>
  }
}

/**
 * @category instances
 * @since 2.0.0
 */
export function getShow<A>(S: Show<A>): Show<Option<A>> {
  return {
    show: (ma) => (isNone(ma) ? 'none' : `some(${S.show(ma.value)})`)
  }
}

/**
 * @example
 * import { none, some, getEq } from 'fp-ts/lib/Option'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * const E = getEq(eqNumber)
 * assert.strictEqual(E.equals(none, none), true)
 * assert.strictEqual(E.equals(none, some(1)), false)
 * assert.strictEqual(E.equals(some(1), none), false)
 * assert.strictEqual(E.equals(some(1), some(2)), false)
 * assert.strictEqual(E.equals(some(1), some(1)), true)
 *
 * @category instances
 * @since 2.0.0
 */
export function getEq<A>(E: Eq<A>): Eq<Option<A>> {
  return {
    equals: (x, y) => x === y || (isNone(x) ? isNone(y) : isNone(y) ? false : E.equals(x.value, y.value))
  }
}
/**
 * The `Ord` instance allows `Option` values to be compared with
 * `compare`, whenever there is an `Ord` instance for
 * the type the `Option` contains.
 *
 * `None` is considered to be less than any `Some` value.
 *
 *
 * @example
 * import { none, some, getOrd } from 'fp-ts/lib/Option'
 * import { ordNumber } from 'fp-ts/lib/Ord'
 *
 * const O = getOrd(ordNumber)
 * assert.strictEqual(O.compare(none, none), 0)
 * assert.strictEqual(O.compare(none, some(1)), -1)
 * assert.strictEqual(O.compare(some(1), none), 1)
 * assert.strictEqual(O.compare(some(1), some(2)), -1)
 * assert.strictEqual(O.compare(some(1), some(1)), 0)
 *
 * @category instances
 * @since 2.0.0
 */
export function getOrd<A>(O: Ord<A>): Ord<Option<A>> {
  return {
    equals: getEq(O).equals,
    compare: (x, y) => (x === y ? 0 : isSome(x) ? (isSome(y) ? O.compare(x.value, y.value) : 1) : -1)
  }
}

/**
 * `Apply` semigroup
 *
 * | x       | y       | concat(x, y)       |
 * | ------- | ------- | ------------------ |
 * | none    | none    | none               |
 * | some(a) | none    | none               |
 * | none    | some(a) | none               |
 * | some(a) | some(b) | some(concat(a, b)) |
 *
 * @example
 * import { getApplySemigroup, some, none } from 'fp-ts/lib/Option'
 * import { semigroupSum } from 'fp-ts/lib/Semigroup'
 *
 * const S = getApplySemigroup(semigroupSum)
 * assert.deepStrictEqual(S.concat(none, none), none)
 * assert.deepStrictEqual(S.concat(some(1), none), none)
 * assert.deepStrictEqual(S.concat(none, some(1)), none)
 * assert.deepStrictEqual(S.concat(some(1), some(2)), some(3))
 *
 * @category instances
 * @since 2.0.0
 */
export function getApplySemigroup<A>(S: Semigroup<A>): Semigroup<Option<A>> {
  return {
    concat: (x, y) => (isSome(x) && isSome(y) ? some(S.concat(x.value, y.value)) : none)
  }
}

/**
 * @category instances
 * @since 2.0.0
 */
export function getApplyMonoid<A>(M: Monoid<A>): Monoid<Option<A>> {
  return {
    concat: getApplySemigroup(M).concat,
    empty: some(M.empty)
  }
}

/**
 * Monoid returning the left-most non-`None` value
 *
 * | x       | y       | concat(x, y) |
 * | ------- | ------- | ------------ |
 * | none    | none    | none         |
 * | some(a) | none    | some(a)      |
 * | none    | some(a) | some(a)      |
 * | some(a) | some(b) | some(a)      |
 *
 * @example
 * import { getFirstMonoid, some, none } from 'fp-ts/lib/Option'
 *
 * const M = getFirstMonoid<number>()
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(1))
 *
 * @category instances
 * @since 2.0.0
 */
export function getFirstMonoid<A = never>(): Monoid<Option<A>> {
  return {
    concat: (x, y) => (isNone(x) ? y : x),
    empty: none
  }
}

/**
 * Monoid returning the right-most non-`None` value
 *
 * | x       | y       | concat(x, y) |
 * | ------- | ------- | ------------ |
 * | none    | none    | none         |
 * | some(a) | none    | some(a)      |
 * | none    | some(a) | some(a)      |
 * | some(a) | some(b) | some(b)      |
 *
 * @example
 * import { getLastMonoid, some, none } from 'fp-ts/lib/Option'
 *
 * const M = getLastMonoid<number>()
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(2))
 *
 * @category instances
 * @since 2.0.0
 */
export function getLastMonoid<A = never>(): Monoid<Option<A>> {
  return {
    concat: (x, y) => (isNone(y) ? x : y),
    empty: none
  }
}

/**
 * Monoid returning the left-most non-`None` value. If both operands are `Some`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * | x       | y       | concat(x, y)       |
 * | ------- | ------- | ------------------ |
 * | none    | none    | none               |
 * | some(a) | none    | some(a)            |
 * | none    | some(a) | some(a)            |
 * | some(a) | some(b) | some(concat(a, b)) |
 *
 * @example
 * import { getMonoid, some, none } from 'fp-ts/lib/Option'
 * import { semigroupSum } from 'fp-ts/lib/Semigroup'
 *
 * const M = getMonoid(semigroupSum)
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(3))
 *
 * @category instances
 * @since 2.0.0
 */
export function getMonoid<A>(S: Semigroup<A>): Monoid<Option<A>> {
  return {
    concat: (x, y) => (isNone(x) ? y : isNone(y) ? x : some(S.concat(x.value, y.value))),
    empty: none
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
export const Applicative: Applicative1<URI> = {
  URI,
  map,
  ap,
  of
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Monad: Monad1<URI> = {
  URI,
  map,
  ap,
  of,
  chain: chain_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Foldable: Foldable1<URI> = {
  URI,
  reduce,
  foldMap,
  reduceRight
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
export const Alternative: Alternative1<URI> = {
  URI,
  map,
  ap,
  of,
  alt: alt_,
  zero
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Extend: Extend1<URI> = {
  URI,
  map,
  extend: extend_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Compactable: Compactable1<URI> = {
  URI,
  compact,
  separate
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Filterable: Filterable1<URI> = {
  URI,
  map,
  compact,
  separate,
  filter: filter_,
  filterMap: filterMap_,
  partition: partition_,
  partitionMap: partitionMap_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Traversable: Traversable1<URI> = {
  URI,
  map,
  reduce,
  foldMap,
  reduceRight,
  traverse: traverse_,
  sequence
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Witherable: Witherable1<URI> = {
  URI,
  map,
  reduce,
  foldMap,
  reduceRight,
  traverse: traverse_,
  sequence,
  compact,
  separate,
  filter: filter_,
  filterMap: filterMap_,
  partition: partition_,
  partitionMap: partitionMap_,
  wither: wither_,
  wilt: wilt_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const MonadThrow: MonadThrow1<URI> = {
  URI,
  map,
  ap,
  of,
  chain: chain_,
  throwError
}

// TODO: remove instance in v3
/**
 * @category instances
 * @since 2.0.0
 */
export const option: Monad1<URI> &
  Foldable1<URI> &
  Alternative1<URI> &
  Extend1<URI> &
  Witherable1<URI> &
  MonadThrow1<URI> = {
  URI,
  map,
  of,
  ap,
  chain: chain_,
  reduce,
  foldMap,
  reduceRight,
  traverse: traverse_,
  sequence,
  zero,
  alt: alt_,
  extend: extend_,
  compact,
  separate,
  filter: filter_,
  filterMap: filterMap_,
  partition: partition_,
  partitionMap: partitionMap_,
  wither: wither_,
  wilt: wilt_,
  throwError
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Returns `true` if `ma` contains `a`
 *
 * @example
 * import { some, none, elem } from 'fp-ts/lib/Option'
 * import { eqNumber } from 'fp-ts/lib/Eq'
 *
 * assert.strictEqual(elem(eqNumber)(1, some(1)), true)
 * assert.strictEqual(elem(eqNumber)(2, some(1)), false)
 * assert.strictEqual(elem(eqNumber)(1, none), false)
 *
 * @since 2.0.0
 */
export function elem<A>(E: Eq<A>): (a: A, ma: Option<A>) => boolean {
  return (a, ma) => (isNone(ma) ? false : E.equals(a, ma.value))
}

/**
 * Returns `true` if the predicate is satisfied by the wrapped value
 *
 * @example
 * import { some, none, exists } from 'fp-ts/lib/Option'
 * import { pipe } from 'fp-ts/lib/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     exists(n => n > 0)
 *   ),
 *   true
 * )
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     exists(n => n > 1)
 *   ),
 *   false
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     exists(n => n > 0)
 *   ),
 *   false
 * )
 *
 * @since 2.0.0
 */
export function exists<A>(predicate: Predicate<A>): (ma: Option<A>) => boolean {
  return (ma) => (isNone(ma) ? false : predicate(ma.value))
}

/**
 * Returns a `Refinement` (i.e. a custom type guard) from a `Option` returning function.
 * This function ensures that a custom type guard definition is type-safe.
 *
 * ```ts
 * import { some, none, getRefinement } from 'fp-ts/lib/Option'
 *
 * type A = { type: 'A' }
 * type B = { type: 'B' }
 * type C = A | B
 *
 * const isA = (c: C): c is A => c.type === 'B' // <= typo but typescript doesn't complain
 * const isA = getRefinement<C, A>(c => (c.type === 'B' ? some(c) : none)) // static error: Type '"B"' is not assignable to type '"A"'
 * ```
 *
 * @since 2.0.0
 */
export function getRefinement<A, B extends A>(getOption: (a: A) => Option<B>): Refinement<A, B> {
  return (a: A): a is B => isSome(getOption(a))
}
