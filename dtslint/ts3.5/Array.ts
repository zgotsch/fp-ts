import * as _ from '../../src/Array'
import { pipe } from '../../src/function'
import { eqNumber } from '../../src/Eq'

declare const rus: ReadonlyArray<unknown>
declare const rns: ReadonlyArray<number>
declare const rss: ReadonlyArray<string>
declare const rtns: ReadonlyArray<readonly [number, string]>

//
// zip
//

pipe(rns, _.zip(rss)) // $ExpectType readonly (readonly [number, string])[]

//
// zipWith
//

// $ExpectType readonly (readonly [number, string])[]
pipe(
  rns,
  _.zipWith(rss, (n, s) => [n, s] as const)
)

//
// unzip
//

_.unzip(rtns) // $ExpectType readonly [readonly number[], readonly string[]]
pipe(rtns, _.unzip) // $ExpectType readonly [readonly number[], readonly string[]]

//
// filter
//

// $ExpectType readonly number[]
pipe(
  rus,
  _.filter((u: unknown): u is number => typeof u === 'number')
)

//
// filterWithIndex
//

// $ExpectType readonly number[]
pipe(
  rus,
  _.filterWithIndex((_, u: unknown): u is number => typeof u === 'number')
)

//
// partition
//

// $ExpectType Separated<readonly unknown[], readonly number[]>
pipe(
  rus,
  _.partition((u: unknown): u is number => typeof u === 'number')
)

//
// partitionWithIndex
//

// $ExpectType Separated<readonly unknown[], readonly number[]>
pipe(
  rus,
  _.partitionWithIndex((_, u: unknown): u is number => typeof u === 'number')
)

//
// spanLeft
//

// $ExpectType Spanned<number, unknown>
pipe(
  rus,
  _.spanLeft((u: unknown): u is number => typeof u === 'number')
)

//
// lookup
//

_.lookup(0) // $ExpectType <A>(as: readonly A[]) => Option<A>

//
// elem
//

_.elem(eqNumber)(1) // $ExpectType (as: readonly number[]) => boolean

//
// difference
//

_.difference(eqNumber)([3, 4]) // $ExpectType (xs: readonly number[]) => readonly number[]

//
// intersection
//

_.intersection(eqNumber)([3, 4]) // $ExpectType (xs: readonly number[]) => readonly number[]

//
// union
//

_.union(eqNumber)([3, 4]) // $ExpectType (xs: readonly number[]) => readonly number[]

//
// zip
//

_.zip(['a', 'b']) // $ExpectType <A>(as: readonly A[]) => readonly (readonly [A, string])[]

//
// cons
//

_.cons(0) // $ExpectType (tail: readonly number[]) => NonEmptyArray<number>
