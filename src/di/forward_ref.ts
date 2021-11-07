/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Type } from '../type';
import { stringify } from '../util';

/**
 * A type that a function passed into `forwardRef()` has to implement.
 *
 * ### Example
 *
```ts
const ref = forwardRef(() => Lock);
```
 */
export type ForwardRefFn = () => any;

/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared,
 * but not yet defined. It is also used when the `token` which we use when creating a query is not
 * yet defined.
 *
 * ### Example
```ts
class Door {
  lock: Lock;

  // Door attempts to inject Lock, despite it not being defined yet.
  // forwardRef makes this possible.
  constructor(@Inject(forwardRef(() => Lock)) lock: Lock) { this.lock = lock; }
}

// Only at this point Lock is defined.
class Lock {}

const injector = ReflectiveInjector.resolveAndCreate([Door, Lock]);
const door = injector.get(Door);
expect(door instanceof Door).toBeTruthy();
expect(door.lock instanceof Lock).toBeTruthy();
```
 */
export function forwardRef(forwardRefFn: ForwardRefFn): Type<any> {
  (forwardRefFn as any).__forward_ref__ = forwardRef;
  (forwardRefFn as any).toString = function() {
    return stringify(this());
  };
  return (forwardRefFn as any) as Type<any>;
}

/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * ### Example:
 *
```ts
const ref = forwardRef(() => 'refValue');
expect(resolveForwardRef(ref)).toEqual('refValue');
expect(resolveForwardRef('regularValue')).toEqual('regularValue');
```
 * See: `forwardRef()`
 */
export function resolveForwardRef(type: any): any {
  if (typeof type == 'function' && type.hasOwnProperty('__forward_ref__') && type.__forward_ref__ === forwardRef) {
    return (type as ForwardRefFn)();
  } else {
    return type;
  }
}
