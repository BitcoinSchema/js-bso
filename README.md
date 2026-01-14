# @bitcoinschema/bso-lib

Bitcoin Social transaction creation library for BSV. Creates OP_RETURN transactions following the B://, MAP, and BSocial protocols.

## Installation

```bash
bun add @bitcoinschema/bso-lib @bsv/sdk
```

## Quick Start

```typescript
import { createPost, createMessage, createLike, Context } from "@bitcoinschema/bso-lib";

// Create a post
const postTx = await createPost("Hello Bitcoin!");

// Create a message in a channel
const msgTx = await createMessage("Hey everyone", { channel: "general" });

// Like a post
const likeTx = await createLike("abc123...txid");
```

## Transaction Functions

All functions are async and return a `Transaction` from `@bsv/sdk`.

### Messages

```typescript
// Simple message
const tx = await createMessage("Hello World");

// Message to a channel
const tx = await createMessage("Channel message", { channel: "general" });

// Direct message to a BAP identity
const tx = await createMessage("Private message", { toBapId: "..." });
```

### Posts

```typescript
// Simple post
const tx = await createPost("My post content");

// Post with context
const tx = await createPost("Check this out", {
  context: Context.URL,
  contextValue: "https://example.com",
});

// Post with tags
const tx = await createPost("Tagged post", {
  tags: ["bitcoin", "bsv"],
});
```

### Replies

```typescript
const tx = await createReply("Great point!", "original-txid");
```

### Likes

```typescript
const tx = await createLike("txid-to-like");
const tx = await createUnlike("txid-to-unlike");
```

### Follows

```typescript
const tx = await createFollow("bap-id-to-follow");
const tx = await createUnfollow("bap-id-to-unfollow");
```

### Videos

```typescript
const tx = await createVideo("youtube", "dQw4w9WgXcQ");

// With duration and start time
const tx = await createVideo("youtube", "dQw4w9WgXcQ", {
  duration: 212,
  start: 30,
});
```

### Reposts & Friends

```typescript
const tx = await createRepost("original-txid");
const tx = await createFriend("bap-id", { publicKey: "..." });
```

## BMAP Client

Query the BMAP API for social data.

```typescript
import {
  getPostsByBapId,
  getFeedByBapId,
  getLikesForPost,
  getChannelMessages,
  subscribeToChannel,
} from "@bitcoinschema/bso-lib";

// Get posts by identity
const posts = await getPostsByBapId("bap-id");

// Get feed (posts from followed users)
const feed = await getFeedByBapId("bap-id");

// Get likes for a post
const likes = await getLikesForPost("txid");

// Get channel messages
const messages = await getChannelMessages("general");

// Subscribe to real-time channel updates (SSE)
const eventSource = subscribeToChannel("general", {
  onMessage: (post) => console.log("New message:", post),
  onError: (err) => console.error(err),
});

// Stop listening
eventSource.close();
```

### Custom Queries

```typescript
import { queryBmap, buildPostsQuery, buildLikesQuery } from "@bitcoinschema/bso-lib";

// Build and execute a custom query
const query = buildPostsQuery({ bapId: "...", limit: 10 });
const posts = await queryBmap("post", query);

// Query builders available:
// buildPostsQuery({ address?, bapId?, channel?, limit? })
// buildMessagesQuery({ channel?, address?, limit? })
// buildLikesQuery({ address?, txid?, limit? })
// buildFollowsQuery({ address?, limit? })
// buildFriendsQuery({ address?, limit? })
```

### Submit Transactions

```typescript
import { ingestTransaction } from "@bitcoinschema/bso-lib";

// Submit a signed transaction to the BMAP indexer
const result = await ingestTransaction(signedTx.toHex());
console.log("Indexed:", result.txid);
```

## Identity Signing

Sign transactions with AIP using your identity key:

```typescript
import { PrivateKey } from "@bsv/sdk";

const identityKey = PrivateKey.fromWif("...");

const tx = await createPost("Signed post", {
  identityKey,
});
```

## Context Types

| Context | Description |
|---------|-------------|
| `Context.Topic` | Categorize by topic |
| `Context.URL` | Reference a URL |
| `Context.Tx` | Reply to a transaction |
| `Context.Channel` | Post to a channel |
| `Context.BapID` | Reference a BAP identity |

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
