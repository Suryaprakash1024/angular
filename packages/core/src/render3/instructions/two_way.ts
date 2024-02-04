/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bindingUpdated} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {RENDERER} from '../interfaces/view';
import {isSignal} from '../reactivity/api';
import {isWritableSignal} from '../reactivity/signal';
import {getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';

import {listenerInternal} from './listener';
import {elementPropertyInternal, storePropertyBindingMetadata} from './shared';


/**
 * Update a two-way bound property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * @param propName Name of property.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 * (e.g. `twoWayProperty('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
export function ɵɵtwoWayProperty<T>(
    propName: string, value: T, sanitizer?: SanitizerFn|null): typeof ɵɵtwoWayProperty {
  // TODO(crisbeto): perf impact of re-evaluating this on each change detection?
  if (isSignal(value)) {
    value = value() as T;
  }

  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(
        tView, tNode, lView, propName, value, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }

  return ɵɵtwoWayProperty;
}

/**
 * Function used inside two-way listeners to conditionally set the value of the bound expression.
 *
 * @param target Field on which to set the value.
 * @param value Value to be set to the field.
 *
 * @codeGenApi
 */
export function ɵɵtwoWayBindingSet<T>(target: unknown, value: T): boolean {
  const canWrite = isWritableSignal(target);
  canWrite && target.set(value);
  return canWrite;
}

/**
 * Adds an event listener that updates a two-way binding to the current node.
 *
 * @param eventName Name of the event.
 * @param listenerFn The function to be called when event emits.
 *
 * @codeGenApi
 */
export function ɵɵtwoWayListener(
    eventName: string, listenerFn: (e?: any) => any): typeof ɵɵtwoWayListener {
  const lView = getLView<{}|null>();
  const tView = getTView();
  const tNode = getCurrentTNode()!;
  listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn);
  return ɵɵtwoWayListener;
}
