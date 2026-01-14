# js-bso Upgrade Plan

## Completed
- [x] Migrated from bsv-wasm to @bsv/sdk
- [x] Added biome for linting
- [x] Added @bopen-io/templates dependency
- [x] Rewrote index.ts to use BSocial template
- [x] Deleted templates.ts (no longer needed)
- [x] Updated tests for async API
- [x] All 8 tests passing
- [x] Build passing

## TODO
- [ ] Publish 0.2.0 to npm (breaking change: async API)
- [ ] Update bso-cli to use npm version

## API Changes (v0.2.0 - BREAKING)

### Before (sync)
```typescript
import { createMessage, createPost, createVideo, Context } from "@bitcoinschema/bso-lib";

const tx = createMessage("Hello", "channel-name");
const tx = createPost("Content", { context: Context.URL, contextValue: "https://example.com" });
const tx = createVideo("youtube", "videoId", { duration: 120, start: 30 });
```

### After (async)
```typescript
import { createMessage, createPost, createVideo, Context } from "@bitcoinschema/bso-lib";

const tx = await createMessage("Hello", "channel-name");
const tx = await createPost("Content", { context: Context.URL, contextValue: "https://example.com" });
const tx = await createVideo("youtube", "videoId", { duration: 120, start: 30 });
```

## Dependencies
```json
{
  "dependencies": {
    "@bopen-io/templates": "^1.1.6"
  },
  "peerDependencies": {
    "@bsv/sdk": "^1.10.0",
    "sigma-protocol": "^0.1.8"
  }
}
```

## Files Removed
- `src/templates.ts` - Replaced by @bopen-io/templates
- `src/utils.ts` - Simplified, only keeps `signTransaction`
