/**
 * @since 2.5.0
 */
import { Applicative, Applicative2C } from './Applicative'
import { Apply2C } from './Apply'
import { Bifunctor2 } from './Bifunctor'
import { Comonad2 } from './Comonad'
import { Extend2 } from './Extend'
import { Foldable2 } from './Foldable'
import { identity, pipe } from './function'
import { Functor2 } from './Functor'
import { HKT } from './HKT'
import { Monad2C } from './Monad'
import { Monoid } from './Monoid'
import { Semigroup } from './Semigroup'
import { Semigroupoid2 } from './Semigroupoid'
import { PipeableTraverse2, Traversable2 } from './Traversable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 2.5.0
 */
export function fst<A, S>(sa: readonly [A, S]): A {
  return sa[0]
}

/**
 * @category destructors
 * @since 2.5.0
 */
export function snd<A, S>(sa: readonly [A, S]): S {
  return sa[1]
}

/**
 * @category combinators
 * @since 2.5.0
 */
export function swap<A, S>(sa: readonly [A, S]): readonly [S, A] {
  return [snd(sa), fst(sa)]
}

/**
 * @category instances
 * @since 2.5.0
 */
export function getApply<S>(S: Semigroup<S>): Apply2C<URI, S> {
  return {
    URI,
    _E: undefined as any,
    map,
    ap: (fa) => (fab) => [fst(fab)(fst(fa)), S.concat(snd(fab), snd(fa))]
  }
}

const of = <S>(M: Monoid<S>) => <A>(a: A): readonly [A, S] => {
  return [a, M.empty]
}

/**
 * @category instances
 * @since 2.5.0
 */
export function getApplicative<S>(M: Monoid<S>): Applicative2C<URI, S> {
  const A = getApply(M)
  return {
    URI,
    _E: undefined as any,
    map: A.map,
    ap: A.ap,
    of: of(M)
  }
}

/**
 * @category instances
 * @since 2.5.0
 */
export function getMonad<S>(M: Monoid<S>): Monad2C<URI, S> {
  const A = getApply(M)
  return {
    URI,
    _E: undefined as any,
    map: A.map,
    ap: A.ap,
    chain: (fa, f) => {
      const [b, s] = f(fst(fa))
      return [b, M.concat(snd(fa), s)]
    },
    of: of(M)
  }
}

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const compose_: Semigroupoid2<URI>['compose'] = (ba, ae) => [fst(ba), snd(ae)]
const bimap_: Bifunctor2<URI>['bimap'] = (fea, f, g) => [g(fst(fea)), f(snd(fea))]
const mapLeft_: Bifunctor2<URI>['mapLeft'] = (fea, f) => [fst(fea), f(snd(fea))]
const extend_: Extend2<URI>['extend'] = (ae, f) => [f(ae), snd(ae)]
const traverse_ = <F>(F: Applicative<F>) => <A, S, B>(
  as: readonly [A, S],
  f: (a: A) => HKT<F, B>
): HKT<F, readonly [B, S]> => {
  return pipe(
    f(fst(as)),
    F.map((b) => [b, snd(as)])
  )
}

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
export const bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => (fa: readonly [A, E]) => readonly [B, G] = (
  f,
  g
) => (fa) => bimap_(fa, f, g)

/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
export const mapLeft: <E, G>(f: (e: E) => G) => <A>(fa: readonly [A, E]) => readonly [A, G] = (f) => (fa) =>
  mapLeft_(fa, f)

/**
 * @category Semigroupoid
 * @since 2.5.0
 */
export const compose: <E, A>(la: readonly [A, E]) => <B>(ab: readonly [B, A]) => readonly [B, E] = (la) => (ab) =>
  compose_(ab, la)

/**
 * @category Extend
 * @since 2.5.0
 */
export const duplicate: <E, A>(ma: readonly [A, E]) => readonly [readonly [A, E], E] = (ma) => extend_(ma, identity)

/**
 * @category Extend
 * @since 2.5.0
 */
export const extend: <E, A, B>(f: (fa: readonly [A, E]) => B) => (wa: readonly [A, E]) => readonly [B, E] = (f) => (
  ma
) => extend_(ma, f)

/**
 * @category Extract
 * @since 2.6.2
 */
export const extract: <E, A>(wa: readonly [A, E]) => A = fst

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
export const map: Functor2<URI>['map'] = (f) => (fa) => [f(fst(fa)), snd(fa)]

/**
 * @category Foldable
 * @since 2.5.0
 */
export const reduce: Foldable2<URI>['reduce'] = (b, f) => (fa) => f(b, fst(fa))

/**
 * @category Foldable
 * @since 2.5.0
 */
export const foldMap: Foldable2<URI>['foldMap'] = () => (f) => (fa) => f(fst(fa))

/**
 * @category Foldable
 * @since 2.5.0
 */
export const reduceRight: Foldable2<URI>['reduceRight'] = (b, f) => (fa) => f(fst(fa), b)

/**
 * @since 2.6.3
 */
export const traverse: PipeableTraverse2<URI> = <F>(
  F: Applicative<F>
): (<A, B>(f: (a: A) => HKT<F, B>) => <S>(as: readonly [A, S]) => HKT<F, readonly [B, S]>) => {
  return (f) => (ta) => traverse_(F)(ta, f)
}

/**
 * @since 2.6.3
 */
export const sequence: Traversable2<URI>['sequence'] = <F>(F: Applicative<F>) => <A, S>(
  fas: readonly [HKT<F, A>, S]
): HKT<F, readonly [A, S]> => {
  return pipe(
    fst(fas),
    F.map((a) => [a, snd(fas)])
  )
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.5.0
 */
export const URI = 'ReadonlyTuple'

/**
 * @category instances
 * @since 2.5.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: readonly [A, E]
  }
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Functor: Functor2<URI> = {
  URI,
  map
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap: bimap_,
  mapLeft: mapLeft_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Semigroupoid: Semigroupoid2<URI> = {
  URI,
  compose: compose_
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Comonad: Comonad2<URI> = {
  URI,
  map,
  extend: extend_,
  extract
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Foldable: Foldable2<URI> = {
  URI,
  reduce,
  foldMap,
  reduceRight
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Traversable: Traversable2<URI> = {
  URI,
  map,
  reduce,
  foldMap,
  reduceRight,
  traverse: traverse_,
  sequence
}

// TODO: remove instance in v3
/**
 * @category instances
 * @since 2.5.0
 */
export const readonlyTuple: Semigroupoid2<URI> &
  Bifunctor2<URI> &
  Comonad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> = {
  URI,
  compose: compose_,
  map,
  bimap: bimap_,
  mapLeft: mapLeft_,
  extract,
  extend: extend_,
  reduce,
  foldMap,
  reduceRight,
  traverse: traverse_,
  sequence
}
