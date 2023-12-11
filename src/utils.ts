import { PrivateKey, Script, Transaction, TxOut } from "bsv-wasm";
import { Sigma } from "sigma-protocol";

const enum SignatureProtocol {
  Sigma = "sigma",
}
async function signTransaction({
  protocol,
  key,
  tx,
}: {
  protocol: SignatureProtocol;
  key: PrivateKey;
  tx: Transaction;
}) {
  // console.log("signing transaction with data: ", algo, key);
  if (protocol === SignatureProtocol.Sigma) {
    const sigma = new Sigma(tx, 0, 0, 0);
    const { signedTx } = sigma.sign(key);
    return signedTx.to_hex();
  } else {
    throw new Error("Signature algorithm not supported");
  }
}

export interface TransactionOptions {
  scripts?: [{ asm?: string; sats?: number }];
}

function createTransaction(
  data: string[],
  options?: TransactionOptions | undefined
) {
  // console.log("creating transaction with data: ", data);
  try {
    let tx = new Transaction(1, 0);
    const asmString = data.map((d) => Buffer.from(d).toString("hex")).join(" ");
    tx.add_output(
      new TxOut(
        BigInt(0),
        Script.from_asm_string(`OP_0 OP_RETURN ${asmString}`)
      )
    );

    if (options) {
      // if scripts are provided, add them to the transaction
      const { scripts } = options;
      if (scripts) {
        for (const script of scripts) {
          const { asm, sats } = script;
          if (asm) {
            const script = Script.from_asm_string(asm);
            tx.add_output(new TxOut(BigInt(sats || 0), script));
          }
        }
      }
    }
    return tx;
  } catch (e) {
    console.error("Error creating transaction: ", e);
  }
}

export { createTransaction, signTransaction };
