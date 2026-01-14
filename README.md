# @bitcoinschema/bso-lib

Bitcoin Social transaction creation library for BSV. Creates OP_RETURN transactions following the B:// and MAP protocols.

## Installation

```bash
bun add @bitcoinschema/bso-lib @bsv/sdk
```

## Usage

```typescript
import { createMessage, createPost, createVideo, Context } from "@bitcoinschema/bso-lib";
```

### Create a Message

Messages are real-time ephemeral content, typically used in chat channels.

```typescript
const tx = createMessage("Hello World");

// With channel context
const tx = createMessage("Hello World", "general");
```

### Create a Post

Posts are permanent content, similar to social media posts.

```typescript
const tx = createPost("My first post");

// With URL context
const tx = createPost("Check this out", {
  context: Context.URL,
  contextValue: "https://example.com",
});

// With topic context
const tx = createPost("Bitcoin discussion", {
  context: Context.Topic,
  contextValue: "bitcoin",
});

// Reply to a transaction
const tx = createPost("Great point!", {
  context: Context.Tx,
  contextValue: "abc123...txid",
});
```

### Create a Video

Videos reference external video content with metadata.

```typescript
const tx = createVideo("youtube", "dQw4w9WgXcQ");

// With duration and start time
const tx = createVideo("youtube", "dQw4w9WgXcQ", {
  duration: 212,
  start: 30,
});
```

## Transaction Structure

All functions return a `Transaction` from `@bsv/sdk` with OP_RETURN outputs following the B:// and MAP protocols:

- **B://** (`19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut`) - Content storage protocol
- **MAP** (`1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5`) - Metadata attribute protocol

### Signing Transactions

Use [sigma-protocol](https://github.com/BitcoinSchema/sigma-protocol) for transaction signing:

```typescript
import { signTransaction, SignatureProtocol } from "@bitcoinschema/bso-lib";
import { PrivateKey } from "@bsv/sdk";

const key = PrivateKey.fromWif("...");
const tx = createPost("Signed post");
const signedHex = await signTransaction({
  protocol: SignatureProtocol.Sigma,
  key,
  tx,
});
```

## Context Types

| Context | Description |
|---------|-------------|
| `Context.Topic` | Categorize by topic |
| `Context.URL` | Reference a URL |
| `Context.Tx` | Reply to a transaction |
| `Context.Channel` | Post to a channel |

## Development

```bash
bun install       # Install dependencies
bun test          # Run tests
bun run build     # Build for production
bun run lint      # Check code style
bun run lint:fix  # Fix code style
```

## License

MIT
