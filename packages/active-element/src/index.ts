import { ClearListeners, createEventListenerMap } from "@solid-primitives/event-listener";
import { access, Fn, MaybeAccessor, createCallbackStack } from "@solid-primitives/utils";
import { Accessor, createComputed, createEffect, createSignal, JSX } from "solid-js";

export type IsElementActiveProps = (isActive: boolean) => void;
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      isElementActive: IsElementActiveProps;
    }
  }
}
// This ensures the `JSX` import won't fall victim to tree shaking
export type E = JSX.Element;

/**
 * A reactive `document.activeElement`. Check which element is currently focused.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#createActiveElement
 * @example
 * const [activeEl, { stop, start }] = createActiveElement()
 */
export function createActiveElement(): [getter: Accessor<null | Element>, clear: ClearListeners] {
  const [active, setActive] = createSignal<Element | null>(null);
  const handleChange = () => setActive(window.document.activeElement);

  const toCleanup = createCallbackStack();
  const start = () => {
    toCleanup.execute();
    handleChange();
    toCleanup.push(
      createEventListenerMap(window, { blur: handleChange, focus: handleChange }, true)
    );
  };
  start();

  return [active, toCleanup.execute];
}

/**
 * Pass in an element, and see if it's focused.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#createIsElementActive
 * @example
 * const [isFocused, { stop, start }] = createIsElementActive(() => el)
 */
export function createIsElementActive(
  target: MaybeAccessor<Element>
): [getter: Accessor<boolean>, clear: ClearListeners] {
  const [isActive, setIsActive] = createSignal(false);
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  const toCleanup = createCallbackStack();
  const start = () => {
    toCleanup.execute();
    const el = access(target);
    if (!el) return setIsActive(false);
    setIsActive(window.document.activeElement === el);
    toCleanup.push(createEventListenerMap(el, { blur: handleBlur, focus: handleFocus }, true));
  };

  const el = access(target);
  setIsActive(!!el && window.document.activeElement === el);

  createEffect(start);

  return [isActive, toCleanup.execute];
}

/**
 * Use as a directive. Notifies you when the element becomes active or inactive.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#createIsElementActive
 *
 * @example
 * const [active, setActive] = createSignal(false)
 * <input use:isElementActive={setActive} />
 */
export function isElementActive(target: Element, callback: Accessor<IsElementActiveProps>): void {
  const [isFocused] = createIsElementActive(target);
  createComputed(() => callback()(isFocused()));
}
