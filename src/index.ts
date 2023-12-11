import { LOCKUP_PREFIX, LOCKUP_SUFFIX } from "../constants";
import { templates } from "./templates";
import { TransactionOptions, createTransaction } from "./utils";

export const enum Context {
  Topic = "topic",
  URL = "url",
  Tx = "tx",
  Channel = "channel",
}

const createMessage = (message: string, channel?: string) => {
  const template = templates.find((t) => t.name === "message")!;
  template.data[1] = message;
  if (channel) {
    template.data.push("context");
    template.data.push("channel");
    template.data.push("channel");
    template.data.push(channel);
  }
  return createTransaction(template.data);
};

// const scriptTemplate = `${LOCKUP_PREFIX} ${addressHex} ${nLockTimeHexHeight} ${LOCKUP_SUFFIX}`;

const createPost = (
  content: string,
  options: {
    context?: Context;
    contextValue?: string;
    lock?: number;
    lockAddress?: string;
    lockHeight?: string;
    lockSats?: number;
  }
) => {
  const { context, contextValue } = options;
  const template = templates.find((t) => t.name === "post")!;
  template.data[1] = content;
  if (context && contextValue) {
    template.data.push(...["context", context, context, contextValue]);
  }

  const { lock, lockAddress, lockHeight, lockSats } = options;
  let opts: TransactionOptions | undefined;
  if (lock && lockAddress && lockHeight) {
    const addressHex = Buffer.from(lockAddress).toString("hex");
    const nLockTimeHexHeight = Buffer.from(lockHeight).toString("hex");
    const scriptTemplate = `${LOCKUP_PREFIX} ${addressHex} ${nLockTimeHexHeight} ${LOCKUP_SUFFIX}`;
    opts = { scripts: [{ asm: scriptTemplate, sats: lockSats }] };
  }
  return createTransaction(template.data, opts);
};

const createVideo = (
  provider: string,
  videoID: string,
  duration?: number,
  start?: number
) => {
  const template = templates.find((t) => t.name === "video")!;
  const context = "videoID";
  const contextValue = videoID;
  const subContext = "provider";
  const subContextValue = provider;
  if (context && contextValue) {
    template.data.push("context");
    template.data.push(context);
    template.data.push(context);
    template.data.push(contextValue);
  }
  if (subContext && subContextValue) {
    template.data.push("subContext");
    template.data.push(subContext);
    template.data.push(subContext);
    template.data.push(subContextValue);
  }
  if (duration) {
    template.data.push("duration");
    template.data.push(duration.toString());
  }
  if (start) {
    template.data.push("start");
    template.data.push(start.toString());
  }
  return createTransaction(template.data);
};

export { createMessage, createPost, createVideo };
