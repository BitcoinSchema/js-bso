/**
 * BMAP API client for querying and streaming BSocial data
 */

const BMAP_API_BASE = "https://bmap-api-production.up.railway.app";

// ============================================================================
// TYPES
// ============================================================================

export interface BmapPost {
	tx: { h: string };
	blk?: { t: number; i: number };
	timestamp?: number;
	MAP: Array<{ app: string; type: string; [key: string]: string }>;
	B?: Array<{ content: string; "content-type": string; encoding: string }>;
	AIP?: Array<{ address: string; signature: string }>;
	SIGMA?: Array<{ address: string; signature: string }>;
}

export interface BmapQuery {
	v: number;
	q: {
		find: Record<string, unknown>;
		sort?: Record<string, number>;
		limit?: number;
		skip?: number;
	};
}

export type BmapCollection = "post" | "message" | "like" | "follow" | "friend" | "video" | "repost";

export interface SSEOptions {
	onMessage: (data: BmapPost) => void;
	onError?: (error: Error) => void;
	onOpen?: () => void;
}

// ============================================================================
// REST API FUNCTIONS
// ============================================================================

/**
 * Get posts by BAP ID
 */
export async function getPostsByBapId(bapId: string): Promise<BmapPost[]> {
	const response = await fetch(`${BMAP_API_BASE}/social/post/bap/${bapId}`);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Get feed for a BAP ID (posts from followed users)
 */
export async function getFeedByBapId(bapId: string): Promise<BmapPost[]> {
	const response = await fetch(`${BMAP_API_BASE}/social/feed/${bapId}`);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Search posts
 */
export async function searchPosts(query: string): Promise<BmapPost[]> {
	const response = await fetch(
		`${BMAP_API_BASE}/social/post/search?q=${encodeURIComponent(query)}`,
	);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Get likes for a specific post
 */
export async function getLikesForPost(txid: string): Promise<BmapPost[]> {
	const response = await fetch(`${BMAP_API_BASE}/social/post/${txid}/like`);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Get likes by a user
 */
export async function getLikesByBapId(bapId: string): Promise<BmapPost[]> {
	const response = await fetch(`${BMAP_API_BASE}/social/bap/${bapId}/like`);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Get friends for a BAP ID
 */
export async function getFriendsByBapId(bapId: string): Promise<BmapPost[]> {
	const response = await fetch(`${BMAP_API_BASE}/social/friend/${bapId}`);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Get messages for a user
 */
export async function getMessagesByBapId(bapId: string): Promise<BmapPost[]> {
	const response = await fetch(`${BMAP_API_BASE}/social/@/${bapId}/messages`);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

/**
 * Get messages in a channel
 */
export async function getChannelMessages(channelId: string): Promise<BmapPost[]> {
	const response = await fetch(
		`${BMAP_API_BASE}/social/channels/${channelId}/messages`,
	);
	if (!response.ok) throw new Error(`BMAP API error: ${response.status}`);
	return (await response.json()) as BmapPost[];
}

// ============================================================================
// RAW QUERY API
// ============================================================================

function encodeQuery(query: BmapQuery): string {
	return btoa(JSON.stringify(query));
}

/**
 * Execute a raw BMAP query
 */
export async function queryBmap(
	collection: BmapCollection,
	query: BmapQuery,
): Promise<BmapPost[]> {
	const encoded = encodeQuery(query);
	const response = await fetch(`${BMAP_API_BASE}/q/${collection}/${encoded}`);

	if (!response.ok) {
		throw new Error(`BMAP API error: ${response.status}`);
	}

	const data = (await response.json()) as { c?: BmapPost[]; u?: BmapPost[] } | BmapPost[];
	if (Array.isArray(data)) {
		return data;
	}
	return data.c || data.u || [];
}

// ============================================================================
// QUERY BUILDERS
// ============================================================================

export function buildPostsQuery(options: {
	address?: string;
	bapId?: string;
	channel?: string;
	limit?: number;
}): BmapQuery {
	const find: Record<string, unknown> = {
		"MAP.app": "bsocial",
		"MAP.type": "post",
	};

	if (options.address) {
		find["AIP.address"] = options.address;
	}
	if (options.bapId) {
		find["AIP.bapId"] = options.bapId;
	}
	if (options.channel) {
		find["MAP.context"] = "channel";
		find["MAP.contextValue"] = options.channel;
	}

	return {
		v: 3,
		q: {
			find,
			sort: { timestamp: -1, "blk.t": -1 },
			limit: options.limit ?? 20,
		},
	};
}

export function buildMessagesQuery(options: {
	channel?: string;
	address?: string;
	limit?: number;
}): BmapQuery {
	const find: Record<string, unknown> = {
		"MAP.app": "bsocial",
		"MAP.type": "message",
	};

	if (options.channel) {
		find["MAP.channel"] = options.channel;
	}
	if (options.address) {
		find["AIP.address"] = options.address;
	}

	return {
		v: 3,
		q: {
			find,
			sort: { timestamp: -1, "blk.t": -1 },
			limit: options.limit ?? 50,
		},
	};
}

export function buildLikesQuery(options: {
	address?: string;
	txid?: string;
	limit?: number;
}): BmapQuery {
	const find: Record<string, unknown> = {
		"MAP.app": "bsocial",
		"MAP.type": "like",
	};

	if (options.address) {
		find["AIP.address"] = options.address;
	}
	if (options.txid) {
		find["MAP.tx"] = options.txid;
	}

	return {
		v: 3,
		q: {
			find,
			sort: { timestamp: -1, "blk.t": -1 },
			limit: options.limit ?? 20,
		},
	};
}

export function buildFollowsQuery(options: {
	address?: string;
	limit?: number;
}): BmapQuery {
	return {
		v: 3,
		q: {
			find: {
				"MAP.app": "bsocial",
				"MAP.type": "follow",
				"AIP.address": options.address,
			},
			sort: { timestamp: -1, "blk.t": -1 },
			limit: options.limit ?? 100,
		},
	};
}

export function buildFriendsQuery(options: {
	address?: string;
	limit?: number;
}): BmapQuery {
	return {
		v: 3,
		q: {
			find: {
				"MAP.app": "bsocial",
				"MAP.type": "friend",
				"AIP.address": options.address,
			},
			sort: { timestamp: -1, "blk.t": -1 },
			limit: options.limit ?? 100,
		},
	};
}

// ============================================================================
// SSE STREAMING
// ============================================================================

/**
 * Subscribe to real-time updates for a channel
 * Returns an EventSource that can be closed with .close()
 */
export function subscribeToChannel(
	channel: string,
	options: SSEOptions,
): EventSource {
	const query = buildMessagesQuery({ channel, limit: 1 });
	const encoded = encodeQuery(query);
	const url = `${BMAP_API_BASE}/s/message/${encoded}`;

	// biome-ignore lint/suspicious/noExplicitAny: EventSource constructor types vary between environments
	const eventSource = new (EventSource as any)(url);

	eventSource.onmessage = (event: { data: string }) => {
		try {
			const data = JSON.parse(event.data) as BmapPost | BmapPost[];
			if (Array.isArray(data)) {
				for (const item of data) {
					options.onMessage(item);
				}
			} else {
				options.onMessage(data);
			}
		} catch (error) {
			options.onError?.(error as Error);
		}
	};

	eventSource.onerror = () => {
		options.onError?.(new Error("SSE connection error"));
	};

	eventSource.onopen = () => {
		options.onOpen?.();
	};

	return eventSource;
}

/**
 * Subscribe to real-time updates for posts
 * Returns an EventSource that can be closed with .close()
 */
export function subscribeToPosts(
	options: SSEOptions & { channel?: string; address?: string },
): EventSource {
	const query = buildPostsQuery({
		channel: options.channel,
		address: options.address,
		limit: 1,
	});
	const encoded = encodeQuery(query);
	const url = `${BMAP_API_BASE}/s/post/${encoded}`;

	// biome-ignore lint/suspicious/noExplicitAny: EventSource constructor types vary between environments
	const eventSource = new (EventSource as any)(url);

	eventSource.onmessage = (event: { data: string }) => {
		try {
			const data = JSON.parse(event.data) as BmapPost | BmapPost[];
			if (Array.isArray(data)) {
				for (const item of data) {
					options.onMessage(item);
				}
			} else {
				options.onMessage(data);
			}
		} catch (error) {
			options.onError?.(error as Error);
		}
	};

	eventSource.onerror = () => {
		options.onError?.(new Error("SSE connection error"));
	};

	eventSource.onopen = () => {
		options.onOpen?.();
	};

	return eventSource;
}

/**
 * Subscribe to real-time updates with a custom query
 * Returns an EventSource that can be closed with .close()
 */
export function subscribeToQuery(
	collection: BmapCollection,
	query: BmapQuery,
	options: SSEOptions,
): EventSource {
	const encoded = encodeQuery(query);
	const url = `${BMAP_API_BASE}/s/${collection}/${encoded}`;

	// biome-ignore lint/suspicious/noExplicitAny: EventSource constructor types vary between environments
	const eventSource = new (EventSource as any)(url);

	eventSource.onmessage = (event: { data: string }) => {
		try {
			const data = JSON.parse(event.data) as BmapPost | BmapPost[];
			if (Array.isArray(data)) {
				for (const item of data) {
					options.onMessage(item);
				}
			} else {
				options.onMessage(data);
			}
		} catch (error) {
			options.onError?.(error as Error);
		}
	};

	eventSource.onerror = () => {
		options.onError?.(new Error("SSE connection error"));
	};

	eventSource.onopen = () => {
		options.onOpen?.();
	};

	return eventSource;
}

// ============================================================================
// INGEST API
// ============================================================================

/**
 * Submit a transaction to the BMAP indexer
 */
export async function ingestTransaction(
	rawTx: string,
): Promise<{ txid: string }> {
	const response = await fetch(`${BMAP_API_BASE}/ingest`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ rawTx }),
	});

	if (!response.ok) {
		throw new Error(`BMAP ingest error: ${response.status}`);
	}

	return (await response.json()) as { txid: string };
}
