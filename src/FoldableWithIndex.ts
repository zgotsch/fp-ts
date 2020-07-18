/**
 * A `Foldable` with an additional index.
 * A `FoldableWithIndex` instance must be compatible with its `Foldable` instance
 *
 * ```ts
 * reduce(fa, b, f) = reduceWithIndex(fa, b, (_, b, a) => f(b, a))
 * foldMap(M)(fa, f) = foldMapWithIndex(M)(fa, (_, a) => f(a))
 * reduceRight(fa, b, f) = reduceRightWithIndex(fa, b, (_, a, b) => f(a, b))
 * ```
 *
 * @since 2.0.0
 */
import { Foldable, Foldable1, Foldable2, Foldable2C, Foldable3, Foldable3C, Foldable4 } from './Foldable'
import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from './HKT'
import { Monoid } from './Monoid'

/**
 * @category type classes
 * @since 3.0.0
 */
export interface FoldableWithIndex<F, I> extends Foldable<F> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => (fa: HKT<F, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => (fa: HKT<F, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => (fa: HKT<F, A>) => B
}

/**
 * @category type classes
 * @since 3.0.0
 */
export interface FoldableWithIndex1<F extends URIS, I> extends Foldable1<F> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => (fa: Kind<F, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => (fa: Kind<F, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => (fa: Kind<F, A>) => B
}

/**
 * @category type classes
 * @since 3.0.0
 */
export interface FoldableWithIndex2<F extends URIS2, I> extends Foldable2<F> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => <E>(fa: Kind2<F, E, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => <E>(fa: Kind2<F, E, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => <E>(fa: Kind2<F, E, A>) => B
}

/**
 * @category type classes
 * @since 3.0.0
 */
export interface FoldableWithIndex2C<F extends URIS2, I, E> extends Foldable2C<F, E> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => (fa: Kind2<F, E, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => (fa: Kind2<F, E, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => (fa: Kind2<F, E, A>) => B
}

/**
 * @category type classes
 * @since 3.0.0
 */
export interface FoldableWithIndex3<F extends URIS3, I> extends Foldable3<F> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => <R, E>(fa: Kind3<F, R, E, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => <R, E>(fa: Kind3<F, R, E, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => <R, E>(fa: Kind3<F, R, E, A>) => B
}

/**
 * @category type classes
 * @since 2.2.0
 */
export interface FoldableWithIndex3C<F extends URIS3, I, E> extends Foldable3C<F, E> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => <R>(fa: Kind3<F, R, E, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => <R>(fa: Kind3<F, R, E, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => <R>(fa: Kind3<F, R, E, A>) => B
}

/**
 * @category type classes
 * @since 3.0.0
 */
export interface FoldableWithIndex4<F extends URIS4, I> extends Foldable4<F> {
  readonly reduceWithIndex: <A, B>(b: B, f: (i: I, b: B, a: A) => B) => <S, R, E>(fa: Kind4<F, S, R, E, A>) => B
  readonly foldMapWithIndex: <M>(M: Monoid<M>) => <A>(f: (i: I, a: A) => M) => <S, R, E>(fa: Kind4<F, S, R, E, A>) => M
  readonly reduceRightWithIndex: <A, B>(b: B, f: (i: I, a: A, b: B) => B) => <S, R, E>(fa: Kind4<F, S, R, E, A>) => B
}
