import * as _ from '../../src/function'
import * as A from '../../src/Array'

//
// tuple
//

_.tuple() // $ExpectType []
_.tuple(1) // $ExpectType [number]
_.tuple(1, 'a') // $ExpectType [number, string]
_.tuple(1, 'a', true) // $ExpectType [number, string, boolean]

//
// tupled
//

_.tupled(A.insertAt) // $ExpectType <A>(a: [number, A]) => (as: readonly A[]) => Option<readonly A[]>

//
// untupled
//

_.untupled(_.tupled(A.insertAt)) // $ExpectType <A>(i: number, a: A) => (as: readonly A[]) => Option<readonly A[]>
