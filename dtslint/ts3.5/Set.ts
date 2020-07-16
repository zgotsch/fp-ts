import * as _ from '../../src/Set'
import { eqNumber } from '../../src/Eq'

declare const me: ReadonlySet<number>

//
// isSubset
//

_.isSubset(eqNumber)(me) // $ExpectType (me: ReadonlySet<number>) => boolean

//
// elem
//

_.elem(eqNumber)(1) // $ExpectType (set: ReadonlySet<number>) => boolean

//
// union
//

_.union(eqNumber)(me) // $ExpectType (me: ReadonlySet<number>) => ReadonlySet<number>

//
// intersection
//

_.intersection(eqNumber)(me) // $ExpectType (me: ReadonlySet<number>) => ReadonlySet<number>

//
// difference
//

_.difference(eqNumber)(me) // $ExpectType (me: ReadonlySet<number>) => ReadonlySet<number>
