# Signals

Utilities to deal with AbortSignal

```bash
npm i @hazae41/signals
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/signals)

## Features

### Current features
- 100% TypeScript and ESM
- No external dependencies
- Merge signals
- Optional signals
- Promisify signals

## Usage

### Never

```tsx
Signals.never()
```

This can be useful when you want to accept an optional AbortSignal without branching or doing weird merging

```tsx
function run(signal: AbortSignal);

// GOOD EXAMPLE
function f(signal = Signals.never()) {
  run(signal)
}

// BAD EXAMPLE
function g(signal?: AbortSignal) {
  if (signal == null)
    run(new AbortController().signal)
  else
    run(signal)
}
```

### Merge

```tsx
Signals.merge(a, b?)
```

This can be useful when you have signals with different scopes

```tsx
const global = AbortSignal.timeout(10 * 1000)

async function f(parent?: AbortSignal) {
  const signal = Signals.merge(global, parent)

  await fetch("...", { signal })
}
```

### resolveOnAbort / rejectOnAbort

```tsx
Signals.rejectOnAbort(signal)
```

This is very useful when you want to race a signal with a promise

```tsx
async function run();

async function runWithTimeout(delay: number) {
  const signal = AbortSignal.timeout(delay)
  using timeout = Signals.rejectOnAbort(signal)

  await Promise.race([run(), timeout.get()])
}
```

This converts any event-based signal into a disposable promise

You can also use `resolveOnAbort` to avoid storing unhandled promises

```tsx
async function run();

const global = AbortSignal.timeout(10 * 1000)
using timeout = Signals.resolveOnAbort(global)

async function runWithTimeout() {
  const rejectOnAbort = timeout.get().then(() => { throw new Error("Aborted") })

  await Promise.race([run(), rejectOnAbort])
}
```