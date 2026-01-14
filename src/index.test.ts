import { describe, expect, test } from "bun:test";
import { Context, createMessage, createPost, createVideo } from "./index";

describe("createMessage", () => {
	test("creates a message transaction", async () => {
		const tx = await createMessage("Hello World");
		expect(tx).toBeDefined();
		expect(tx.outputs.length).toBe(1);
		expect(tx.outputs[0].satoshis).toBe(0);
	});

	test("creates a message with channel context", async () => {
		const tx = await createMessage("Hello World", "general");
		expect(tx).toBeDefined();
		const script = tx.outputs[0].lockingScript.toASM();
		expect(script).toContain("OP_RETURN");
	});
});

describe("createPost", () => {
	test("creates a post transaction", async () => {
		const tx = await createPost("My first post");
		expect(tx).toBeDefined();
		expect(tx.outputs.length).toBe(1);
		expect(tx.outputs[0].satoshis).toBe(0);
	});

	test("creates a post with URL context", async () => {
		const tx = await createPost("Check this out", {
			context: Context.URL,
			contextValue: "https://example.com",
		});
		expect(tx).toBeDefined();
		const script = tx.outputs[0].lockingScript.toASM();
		expect(script).toContain("OP_RETURN");
	});

	test("creates a post with topic context", async () => {
		const tx = await createPost("Discussion topic", {
			context: Context.Topic,
			contextValue: "bitcoin",
		});
		expect(tx).toBeDefined();
	});
});

describe("createVideo", () => {
	test("creates a video transaction", async () => {
		const tx = await createVideo("youtube", "dQw4w9WgXcQ");
		expect(tx).toBeDefined();
		expect(tx.outputs.length).toBe(1);
	});

	test("creates a video with duration and start time", async () => {
		const tx = await createVideo("youtube", "dQw4w9WgXcQ", {
			duration: 212,
			start: 30,
		});
		expect(tx).toBeDefined();
	});
});

describe("template immutability", () => {
	test("templates are not mutated between calls", async () => {
		const tx1 = await createMessage("First message");
		const tx2 = await createMessage("Second message");

		const script1 = tx1.outputs[0].lockingScript.toHex();
		const script2 = tx2.outputs[0].lockingScript.toHex();

		expect(script1).not.toBe(script2);
	});
});
