import type { PrivateKey, Transaction } from "@bsv/sdk";
import { Sigma } from "sigma-protocol";

export enum SignatureProtocol {
	Sigma = "sigma",
}

export async function signTransaction({
	protocol,
	key,
	tx,
}: {
	protocol: SignatureProtocol;
	key: PrivateKey;
	tx: Transaction;
}): Promise<string> {
	if (protocol === SignatureProtocol.Sigma) {
		const sigma = new Sigma(tx, 0, 0, 0);
		const { signedTx } = sigma.sign(key);
		return signedTx.toHex();
	}
	throw new Error(`Signature protocol "${protocol}" not supported`);
}
