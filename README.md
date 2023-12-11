# bso

Bitcoin Social transaction creation library

```bash
bun add @bitcoinschema/bso-lib
```

```js
import { createMessage, createPost, createVideo } from "bso";
```

## createMessage

```js
// Creates a new message transaction in channel #test
// and returns a `bsv-wasm` transaction
const message = createMessage("Hello World", "test");
```

## createPost

```js
// Creates a post with a url context
const post = createPost("Hello World", {
  context: "url",
  contextValue: "https://google.com",
});
```
