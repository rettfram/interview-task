export let $ = (value = undefined, tag = undefined, effects = new Set(), range = document.createRange()) => {
  let reload = (ctx, strs, vals) => ctx.replaceChildren(range.createContextualFragment(
        strs.map((str, i) => str + (vals[i] ?? '')).join('')
      )),
      remove = (ctx) => ($ && effects.delete($)),
      render = (ctx) => ($ = () => value(ctx), remove = value(ctx) || remove, $ = null)

  typeof value === 'function' && (!tag ?
    (render(), remove()) :
    (!customElements.get(tag) && customElements.define(tag, class extends HTMLElement {
      connectedCallback() { render(this) }
      disconnectedCallback() { remove(this) }
      html(strs, ...vals) { reload(this, strs, vals) }
    })))
    
  return newValue => newValue === undefined ?
    ($ && effects.add($), value) :
    (queueMicrotask(() => effects.forEach($ => $())), value = newValue)
}
window['$'] = $