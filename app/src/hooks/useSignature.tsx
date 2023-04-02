import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useCallback, useEffect, useState } from "react";
import { decodeUTF8 } from "tweetnacl-util";
import { sleep } from "../utils";

const useSignature = () => {
  const [signature, setSignature] = useState("");
  const { connected, publicKey, signMessage } = useWallet();
  useEffect(() => {
    const _signature = localStorage.getItem("signature");
    if (_signature) {
      setSignature(_signature);
    }
  }, []);
  const getSignature = useCallback(async () => {
    try {
      if (!connected && !signMessage && !publicKey) return;
      const message =
        "fluxus.saicharanpogul.xyz wants you to sign in with your solana wallet account: " +
        publicKey?.toBase58();
      const messageBytes = decodeUTF8(message);
      await sleep(0.5);
      const rawSig = signMessage && (await signMessage(messageBytes));
      const _sig = bs58.encode(rawSig as Uint8Array);
      localStorage.setItem("signature", _sig);
      return _sig;
    } catch (error: any) {
      throw error;
    }
  }, [connected, publicKey, signMessage]);
  return { getSignature, signature };
};

export default useSignature;
