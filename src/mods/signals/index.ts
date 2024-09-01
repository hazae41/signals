import { Disposer } from "@hazae41/disposer"
import { Future } from "@hazae41/future"

export function resolveOnAbort(signal: AbortSignal) {
  if (signal.aborted)
    return new Disposer(Promise.resolve(), () => { })

  const resolveOnAbort = new Future<void>()

  const onAbort = () => resolveOnAbort.resolve()
  const onClean = () => signal.removeEventListener("abort", onAbort)

  signal.addEventListener("abort", onAbort, { passive: true })

  resolveOnAbort.promise.then(onClean)

  return new Disposer(resolveOnAbort.promise, onClean)
}

export function rejectOnAbort(signal: AbortSignal) {
  if (signal.aborted)
    return new Disposer(Promise.reject(new Error("Aborted")), () => { })

  const rejectOnAbort = new Future<never>()

  const onAbort = () => rejectOnAbort.reject(new Error("Aborted"))
  const onClean = () => signal.removeEventListener("abort", onAbort)

  signal.addEventListener("abort", onAbort, { passive: true })

  rejectOnAbort.promise.catch(onClean)

  return new Disposer(rejectOnAbort.promise, onClean)
}