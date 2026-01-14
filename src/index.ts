import BSocial, {
	BSocialActionType,
	BSocialContext,
	type BSocialFollow,
	type BSocialLike,
	type BSocialMessage,
	type BSocialPost,
	type BSocialVideo,
} from "@bopen-io/templates/template/bsocial/BSocial.ts";
import { type PrivateKey, Script, Transaction, Utils } from "@bsv/sdk";
import { LOCKUP_PREFIX, LOCKUP_SUFFIX } from "./constants";
import { SignatureProtocol, signTransaction } from "./utils";

// Export signing utilities
export { signTransaction, SignatureProtocol };

// Export BMAP client
export {
	type BmapCollection,
	// Types
	type BmapPost,
	type BmapQuery,
	buildFollowsQuery,
	buildFriendsQuery,
	buildLikesQuery,
	buildMessagesQuery,
	// Query builders
	buildPostsQuery,
	getChannelMessages,
	getFeedByBapId,
	getFriendsByBapId,
	getLikesByBapId,
	getLikesForPost,
	getMessagesByBapId,
	// REST API
	getPostsByBapId,
	// Ingest
	ingestTransaction,
	// Raw query
	queryBmap,
	type SSEOptions,
	searchPosts,
	// SSE streaming
	subscribeToChannel,
	subscribeToPosts,
	subscribeToQuery,
} from "./bmap";

// Re-export types for convenience
export type { BSocialFollow, BSocialLike, BSocialMessage, BSocialPost, BSocialVideo };
export { BSocialActionType, BSocialContext };

export enum Context {
	Topic = "topic",
	URL = "url",
	Tx = "tx",
	Channel = "channel",
	BapID = "bapID",
}

export interface PostOptions {
	context?: Context;
	contextValue?: string;
	tags?: string[];
	identityKey?: PrivateKey;
	lock?: boolean;
	lockAddress?: string;
	lockHeight?: string;
	lockSats?: number;
}

export interface ReplyOptions {
	tags?: string[];
	identityKey?: PrivateKey;
}

export interface VideoOptions {
	duration?: number;
	start?: number;
	identityKey?: PrivateKey;
}

export interface MessageOptions {
	channel?: string;
	toBapId?: string;
	identityKey?: PrivateKey;
}

export interface LikeOptions {
	identityKey?: PrivateKey;
}

export interface FollowOptions {
	identityKey?: PrivateKey;
}

export interface RepostOptions {
	context?: Context;
	contextValue?: string;
	identityKey?: PrivateKey;
}

export interface FriendOptions {
	publicKey?: string;
	identityKey?: PrivateKey;
}

function contextToSocialContext(context?: Context): BSocialContext | undefined {
	if (!context) return undefined;
	switch (context) {
		case Context.Topic:
			return BSocialContext.CHANNEL;
		case Context.URL:
			return BSocialContext.PROVIDER;
		case Context.Tx:
			return BSocialContext.TX;
		case Context.Channel:
			return BSocialContext.CHANNEL;
		case Context.BapID:
			return BSocialContext.BAP_ID;
		default:
			return undefined;
	}
}

function textToHex(text: string): string {
	return Utils.toHex(Utils.toArray(text, "utf8"));
}

// ============================================================================
// CREATE FUNCTIONS
// ============================================================================

/**
 * Create a message transaction
 */
export async function createMessage(
	message: string,
	options: MessageOptions = {},
): Promise<Transaction> {
	const action: BSocialMessage = {
		app: "bsocial",
		type: BSocialActionType.MESSAGE,
		content: message,
	};

	if (options.channel) {
		action.context = BSocialContext.CHANNEL;
		action.contextValue = options.channel;
	} else if (options.toBapId) {
		action.context = BSocialContext.BAP_ID;
		action.contextValue = options.toBapId;
	}

	const lockingScript = await BSocial.createMessage(action, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create a post transaction
 */
export async function createPost(content: string, options: PostOptions = {}): Promise<Transaction> {
	const action: BSocialPost = {
		app: "bsocial",
		type: BSocialActionType.POST,
		content,
		context: contextToSocialContext(options.context),
		contextValue: options.contextValue,
	};

	const lockingScript = await BSocial.createPost(action, options.tags, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });

	// Handle lock output if specified
	const { lock, lockAddress, lockHeight, lockSats } = options;
	if (lock && lockAddress && lockHeight) {
		const addressHex = textToHex(lockAddress);
		const heightHex = textToHex(lockHeight);
		const scriptAsm = `${LOCKUP_PREFIX} ${addressHex} ${heightHex} ${LOCKUP_SUFFIX}`;
		const lockScript = Script.fromASM(scriptAsm);
		tx.addOutput({ satoshis: lockSats ?? 0, lockingScript: lockScript });
	}

	return tx;
}

/**
 * Create a reply transaction
 */
export async function createReply(
	content: string,
	replyToTxId: string,
	options: ReplyOptions = {},
): Promise<Transaction> {
	const action: BSocialPost = {
		app: "bsocial",
		type: BSocialActionType.POST,
		content,
	};

	const lockingScript = await BSocial.createReply(
		action,
		replyToTxId,
		options.tags,
		options.identityKey,
	);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create a like transaction
 */
export async function createLike(txid: string, options: LikeOptions = {}): Promise<Transaction> {
	const action: BSocialLike = {
		app: "bsocial",
		type: BSocialActionType.LIKE,
		txid,
	};

	const lockingScript = await BSocial.createLike(action, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create an unlike transaction
 */
export async function createUnlike(txid: string, options: LikeOptions = {}): Promise<Transaction> {
	const action: BSocialLike = {
		app: "bsocial",
		type: BSocialActionType.UNLIKE,
		txid,
	};

	const lockingScript = await BSocial.createLike(action, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create a follow transaction
 */
export async function createFollow(
	bapId: string,
	options: FollowOptions = {},
): Promise<Transaction> {
	const action: BSocialFollow = {
		app: "bsocial",
		type: BSocialActionType.FOLLOW,
		bapId,
	};

	const lockingScript = await BSocial.createFollow(action, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create an unfollow transaction
 */
export async function createUnfollow(
	bapId: string,
	options: FollowOptions = {},
): Promise<Transaction> {
	const action: BSocialFollow = {
		app: "bsocial",
		type: BSocialActionType.UNFOLLOW,
		bapId,
	};

	const lockingScript = await BSocial.createFollow(action, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create a video transaction
 */
export async function createVideo(
	provider: string,
	videoID: string,
	options: VideoOptions = {},
): Promise<Transaction> {
	const action: BSocialVideo = {
		app: "bsocial",
		type: BSocialActionType.VIDEO,
		provider,
		videoID,
		duration: options.duration,
		start: options.start,
	};

	const lockingScript = await BSocial.createVideo(action, options.identityKey);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create a repost transaction
 * Note: Repost is not in BSocial template, built manually with MAP
 */
export async function createRepost(
	txid: string,
	options: RepostOptions = {},
): Promise<Transaction> {
	const MAP_PREFIX = "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5";

	const mapData = [MAP_PREFIX, "SET", "app", "bsocial", "type", "repost", "tx", txid];

	if (options.context && options.contextValue) {
		const ctx = contextToSocialContext(options.context);
		if (ctx) {
			mapData.push("context", ctx, "contextValue", options.contextValue);
		}
	}

	const asmParts = mapData.map((d) => textToHex(d)).join(" ");
	const lockingScript = Script.fromASM(`OP_0 OP_RETURN ${asmParts}`);

	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

/**
 * Create a friend request transaction
 * Note: Friend is not in BSocial template, built manually with MAP
 */
export async function createFriend(
	bapId: string,
	options: FriendOptions = {},
): Promise<Transaction> {
	const MAP_PREFIX = "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5";

	const mapData = [MAP_PREFIX, "SET", "app", "bsocial", "type", "friend", "bapID", bapId];

	if (options.publicKey) {
		mapData.push("publicKey", options.publicKey);
	}

	const asmParts = mapData.map((d) => textToHex(d)).join(" ");
	const lockingScript = Script.fromASM(`OP_0 OP_RETURN ${asmParts}`);

	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}
