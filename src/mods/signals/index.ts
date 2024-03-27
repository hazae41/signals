import { Disposer } from "@hazae41/disposer"
import { Future } from "@hazae41/future"

export function never() {
  return new AbortController().signal
}

export function merge(a: AbortSignal, b?: AbortSignal) {
  if (b == null)
    return a

  const c = new AbortController()

  const onAbort = (reason?: unknown) => {
    c.abort(reason)

    a.removeEventListener("abort", onAbort)
    b.removeEventListener("abort", onAbort)
  }

  a.addEventListener("abort", onAbort, { passive: true })
  b.addEventListener("abort", onAbort, { passive: true })

  return c.signal
}

export function resolveOnAbort(signal: AbortSignal) {
  const resolveOnAbort = new Future<void>()

  const onAbort = () => resolveOnAbort.resolve()
  const onClean = () => signal.removeEventListener("abort", onAbort)

  signal.addEventListener("abort", onAbort, { passive: true })

  resolveOnAbort.promise.then(onClean).then(() => { throw new Error("Aborted") })

  return new Disposer(resolveOnAbort.promise, onClean)
}

export function rejectOnAbort(signal: AbortSignal) {
  const rejectOnAbort = new Future<never>()

  const onAbort = () => rejectOnAbort.reject(new Error("Aborted"))
  const onClean = () => signal.removeEventListener("abort", onAbort)

  signal.addEventListener("abort", onAbort, { passive: true })

  rejectOnAbort.promise.catch(onClean)

  return new Disposer(rejectOnAbort.promise, onClean)
}