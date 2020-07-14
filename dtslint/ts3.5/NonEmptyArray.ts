import * as _ from '../../src/NonEmptyArray'
import { pipe } from '../../src/function'

declare const rneas: _.NonEmptyArray<string>
declare const rnens: _.NonEmptyArray<number>
declare const rnetns: _.NonEmptyArray<[number, string]>

//
// zip
//

_.zip(rnens, rneas) // $ExpectType NonEmptyArray<readonly [number, string]>
_.zip(rneas) // $ExpectType <A>(as: NonEmptyArray<A>) => NonEmptyArray<readonly [A, string]>

//
// zipWith
//

_.zipWith(rnens, rneas, (n, s) => [n, s] as const) // $ExpectType NonEmptyArray<readonly [number, string]>

//
// unzip
//

_.unzip(rnetns) // $ExpectType readonly [NonEmptyArray<number>, NonEmptyArray<string>]
pipe(rnetns, _.unzip) // $ExpectType readonly [NonEmptyArray<number>, NonEmptyArray<string>]
