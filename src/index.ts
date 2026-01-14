import {
	BSocial,
	BSocialActionType,
	BSocialContext,
	type BSocialMessage,
	type BSocialPost,
	type BSocialVideo,
} from "@bopen-io/templates";
import { Script, Transaction, Utils } from "@bsv/sdk";
import { LOCKUP_PREFIX, LOCKUP_SUFFIX } from "./constants";
import { SignatureProtocol, signTransaction } from "./utils";

export { signTransaction, SignatureProtocol };

export enum Context {
	Topic = "topic",
	URL = "url",
	Tx = "tx",
	Channel = "channel",
}

export interface PostOptions {
	context?: Context;
	contextValue?: string;
	lock?: boolean;
	lockAddress?: string;
	lockHeight?: string;
	lockSats?: number;
}

export interface VideoOptions {
	duration?: number;
	start?: number;
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
		default:
			return undefined;
	}
}

function textToHex(text: string): string {
	return Utils.toHex(Utils.toArray(text, "utf8"));
}

export async function createMessage(message: string, channel?: string): Promise<Transaction> {
	const action: BSocialMessage = {
		app: "bsocial",
		type: BSocialActionType.MESSAGE,
		content: message,
		context: channel ? BSocialContext.CHANNEL : undefined,
		contextValue: channel,
	};

	const lockingScript = await BSocial.createMessage(action);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}

export async function createPost(content: string, options: PostOptions = {}): Promise<Transaction> {
	const action: BSocialPost = {
		app: "bsocial",
		type: BSocialActionType.POST,
		content,
		context: contextToSocialContext(options.context),
		contextValue: options.contextValue,
	};

	const lockingScript = await BSocial.createPost(action);
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

	const lockingScript = await BSocial.createVideo(action);
	const tx = new Transaction();
	tx.addOutput({ satoshis: 0, lockingScript });
	return tx;
}
