import { useWorkspace } from "@/components/WorkspaceProvider";
import { getUrls, NETWORK } from "@/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Fluxus } from "fluxus-sdk";
import { useCallback, useEffect, useState } from "react";
import useTransactionToast from "./useTransactionToast";

const useFluxus = (fetchAccounts = false) => {
  const { connection, program } = useWorkspace();
  const walletAdapter = useWallet();
  const transactionToast = useTransactionToast();

  const [asCreatorConstantFluxAccounts, setAsCreatorConstantFluxAccounts] =
    useState<any>([]);
  const [asReceiverConstantFluxAccounts, setAsReceiverConstantFluxAccounts] =
    useState<any>([]);
  const [
    asCreatorConstantFluxAccountsLoading,
    setAsCreatorConstantFluxAccountsLoading,
  ] = useState(fetchAccounts);
  const [
    asReceiverConstantFluxAccountsLoading,
    setAsReceiverConstantFluxAccountsLoading,
  ] = useState(fetchAccounts);

  const getAsCreatorConstantFluxAccounts = useCallback(async () => {
    if (!walletAdapter.connected || !walletAdapter.publicKey)
      return setAsCreatorConstantFluxAccountsLoading(false);
    try {
      setAsCreatorConstantFluxAccountsLoading(true);
      const accounts = await program?.account.constantFlux.all([
        {
          memcmp: {
            offset: 8,
            bytes: walletAdapter.publicKey.toBase58(),
          },
        },
      ]);
      setAsCreatorConstantFluxAccounts(accounts);
      return accounts;
    } catch (error) {
      throw error;
    } finally {
      setTimeout(() => {
        setAsCreatorConstantFluxAccountsLoading(false);
      }, 1000);
    }
  }, [
    program?.account.constantFlux,
    walletAdapter.connected,
    walletAdapter.publicKey,
  ]);

  const getAsReceiverConstantFluxAccounts = useCallback(async () => {
    if (!walletAdapter.connected || !walletAdapter.publicKey)
      return setAsReceiverConstantFluxAccountsLoading(false);
    try {
      setAsReceiverConstantFluxAccountsLoading(true);
      const accounts = await program?.account.constantFlux.all([
        {
          memcmp: {
            offset: 40,
            bytes: walletAdapter.publicKey.toBase58(),
          },
        },
      ]);
      setAsReceiverConstantFluxAccounts(accounts);
      return accounts;
    } catch (error) {
      throw error;
    } finally {
      setTimeout(() => {
        setAsReceiverConstantFluxAccountsLoading(false);
      }, 1000);
    }
  }, [
    program?.account.constantFlux,
    walletAdapter.connected,
    walletAdapter.publicKey,
  ]);

  const createConstantFlux = useCallback(
    async (
      mint: PublicKey,
      receiver: PublicKey,
      fluxId: string,
      amount: number,
      decimals: number,
      days: number
    ) => {
      try {
        if (!walletAdapter.connected || !walletAdapter.publicKey) return;
        // const [constantFlux] = getConstantFluxPda(
        //   walletAdapter.publicKey,
        //   receiver,
        //   fluxId
        // );
        // const authorityTokenAccount = getAssociatedTokenAddressSync(
        //   mint,
        //   walletAdapter.publicKey
        // );
        // const [vault] = getVaultPda(fluxId);
        // const receiverTokenAccountInfo =
        //   await connection?.getTokenAccountsByOwner(receiver, {
        //     mint,
        //     programId: TOKEN_PROGRAM_ID,
        //   });
        // const receiverTokenAccountKey = getAssociatedTokenAddressSync(
        //   mint,
        //   receiver
        // );
        // const recentBlockhash =
        //   await program?.provider.connection.getLatestBlockhash();
        // const tx = new Transaction({
        //   recentBlockhash: recentBlockhash?.blockhash,
        // });
        // if (receiverTokenAccountInfo?.value.length === 0) {
        //   tx.add(
        //     createAssociatedTokenAccountInstruction(
        //       walletAdapter.publicKey,
        //       receiverTokenAccountKey,
        //       receiver,
        //       mint
        //     )
        //   );
        // }
        // tx.add(
        //   (await program?.methods
        //     .createConstantFlux(
        //       new anchor.BN(amount * 10 ** decimals),
        //       fluxId,
        //       days
        //     )
        //     .accounts({
        //       authority: walletAdapter.publicKey,
        //       recipient: receiver,
        //       constantFlux: constantFlux,
        //       mint: mint,
        //       authorityTokenAccount,
        //       recipientTokenAccount: receiverTokenAccountKey,
        //       vault,
        //     })
        //     .signers([])
        //     .transaction()) as Transaction
        // );
        // tx.feePayer = walletAdapter.publicKey;
        const fluxus = new Fluxus(connection as Connection);
        const { transaction, account } = await fluxus.createConstantFlux(
          walletAdapter.publicKey,
          mint,
          receiver,
          fluxId,
          amount,
          decimals,
          days
        );
        const sig = await walletAdapter.sendTransaction(
          transaction,
          connection as Connection,
          {
            signers: [],
          }
        );
        console.log(
          "Signature:",
          getUrls(NETWORK, sig as string, "tx")?.explorer
        );
        transactionToast(sig as string, "tx");
        const {
          constantFlux,
          authorityTokenAccount,
          receiverTokenAccount,
          vault,
        } = account;
        return {
          signature: sig,
          account: {
            authority: walletAdapter.publicKey.toBase58(),
            recipient: receiver.toBase58(),
            constantFlux: constantFlux.toBase58(),
            mint: mint.toBase58(),
            authorityTokenAccount: authorityTokenAccount.toBase58(),
            receiverTokenAccount: receiverTokenAccount.toBase58(),
            vault: vault.toBase58(),
          },
        };
      } catch (error: any) {
        console.log(error.error);
        throw error;
      }
    },
    [connection, transactionToast, walletAdapter]
  );

  const cancelConstantFlux = useCallback(
    async (mint: PublicKey, receiver: PublicKey, fluxId: string) => {
      try {
        if (!walletAdapter.connected || !walletAdapter.publicKey) return;
        // const [constantFlux] = getConstantFluxPda(
        //   walletAdapter.publicKey,
        //   receiver,
        //   fluxId
        // );
        // const authorityTokenAccount = getAssociatedTokenAddressSync(
        //   mint,
        //   walletAdapter.publicKey
        // );
        // const [vault] = getVaultPda(fluxId);
        // const [vaultAuthority] = getVaultAuthority();
        // const recentBlockhash =
        //   await program?.provider.connection.getLatestBlockhash();
        // const tx = new Transaction({
        //   recentBlockhash: recentBlockhash?.blockhash,
        // });
        // tx.add(
        //   (await program?.methods
        //     .closeConstantFlux(fluxId)
        //     .accounts({
        //       authority: walletAdapter.publicKey,
        //       recipient: receiver,
        //       constantFlux: constantFlux,
        //       mint: mint,
        //       authorityTokenAccount,
        //       vault,
        //       vaultAuthority,
        //     })
        //     .signers([])
        //     .transaction()) as Transaction
        // );
        // tx.feePayer = walletAdapter.publicKey;
        const fluxus = new Fluxus(connection as Connection);
        const { transaction } = await fluxus.cancelConstantFlux(
          walletAdapter.publicKey,
          mint,
          receiver,
          fluxId
        );
        const sig = await walletAdapter.sendTransaction(
          transaction,
          connection as Connection,
          {
            signers: [],
          }
        );
        console.log(
          "Signature:",
          getUrls(NETWORK, sig as string, "tx")?.explorer
        );
        transactionToast(sig as string, "tx");
        await getAsCreatorConstantFluxAccounts();
        return sig;
      } catch (error) {
        throw error;
      }
    },
    [
      connection,
      getAsCreatorConstantFluxAccounts,
      transactionToast,
      walletAdapter,
    ]
  );

  const claimConstantFlux = useCallback(
    async (
      mint: PublicKey,
      authority: PublicKey,
      fluxId: string,
      receiverTokenAccount: PublicKey
    ) => {
      try {
        if (!walletAdapter.connected || !walletAdapter.publicKey) return;
        // const [constantFlux] = getConstantFluxPda(
        //   authority,
        //   walletAdapter.publicKey,
        //   fluxId
        // );
        // const [vault] = getVaultPda(fluxId);
        // const [vaultAuthority] = getVaultAuthority();
        // const recentBlockhash =
        //   await program?.provider.connection.getLatestBlockhash();
        // const tx = new Transaction({
        //   recentBlockhash: recentBlockhash?.blockhash,
        // });
        // tx.add(
        //   (await program?.methods
        //     .claimConstantFlux(fluxId)
        //     .accounts({
        //       authority,
        //       recipient: walletAdapter.publicKey,
        //       constantFlux,
        //       mint,
        //       recipientTokenAccount: receiverTokenAccount,
        //       vaultAuthority,
        //       vault,
        //     })
        //     .signers([])
        //     .transaction()) as Transaction
        // );
        // tx.feePayer = walletAdapter.publicKey;

        //   walletAdapter.publicKey,
        //   receiver,
        //   fluxId
        // );
        // const authorityTokenAccount = getAssociatedTokenAddressSync(
        //   mint,
        //   walletAdapter.publicKey
        // );
        // const [vault] = getVaultPda(fluxId);
        // const receiverTokenAccountInfo =
        //   await connection?.getTokenAccountsByOwner(receiver, {
        //     mint,
        //     programId: TOKEN_PROGRAM_ID,
        //   });
        // const receiverTokenAccountKey = getAssociatedTokenAddressSync(
        //   mint,
        //   receiver
        // );
        // const recentBlockhash =
        //   await program?.provider.connection.getLatestBlockhash();
        // const tx = new Transaction({
        //   recentBlockhash: recentBlockhash?.blockhash,
        // });
        // if (receiverTokenAccountInfo?.value.length === 0) {
        //   tx.add(
        //     createAssociatedTokenAccountInstruction(
        //       walletAdapter.publicKey,
        //       receiverTokenAccountKey,
        //       receiver,
        //       mint
        //     )
        //   );
        // }
        // tx.add(
        //   (await program?.methods
        //     .createConstantFlux(
        //       new anchor.BN(amount * 10 ** decimals),
        //       fluxId,
        //       days
        //     )
        //     .accounts({
        //       authority: walletAdapter.publicKey,
        //       recipient: receiver,
        //       constantFlux: constantFlux,
        //       mint: mint,
        //       authorityTokenAccount,
        //       recipientTokenAccount: receiverTokenAccountKey,
        //       vault,
        //     })
        //     .signers([])
        //     .transaction()) as Transaction
        // );
        // tx.feePayer = walletAdapter.publicKey;
        const fluxus = new Fluxus(connection as Connection);
        const { transaction } = await fluxus.claimConstantFlux(
          mint,
          authority,
          walletAdapter.publicKey,
          fluxId,
          receiverTokenAccount
        );
        const sig = await walletAdapter.sendTransaction(
          transaction,
          connection as Connection,
          {
            signers: [],
          }
        );
        await getAsReceiverConstantFluxAccounts();
        console.log(
          "Signature:",
          getUrls(NETWORK, sig as string, "tx")?.explorer
        );
        transactionToast(sig as string, "tx");
        return sig;
      } catch (error: any) {
        console.log(error.error);
        throw error;
      }
    },
    [
      connection,
      getAsReceiverConstantFluxAccounts,
      transactionToast,
      walletAdapter,
    ]
  );

  const instantDistributionFlux = useCallback(
    async (
      mint: PublicKey,
      receivers: PublicKey[],
      amount: number,
      decimals: number,
      shares: number[]
    ) => {
      try {
        if (!walletAdapter.connected || !walletAdapter.publicKey) return;
        // const basisPointsShares = shares.map((share) => share * 100);
        // const authorityTokenAccount = getAssociatedTokenAddressSync(
        //   mint,
        //   walletAdapter.publicKey
        // );
        // let remainingAccounts: {
        //   pubkey: PublicKey;
        //   isSigner: boolean;
        //   isWritable: boolean;
        // }[] = [];
        // const recentBlockhash =
        //   await program?.provider.connection.getLatestBlockhash();
        // const tx = new Transaction({
        //   recentBlockhash: recentBlockhash?.blockhash,
        // });
        // for await (let receiver of receivers) {
        //   remainingAccounts.push({
        //     pubkey: receiver,
        //     isSigner: false,
        //     isWritable: false,
        //   });
        //   const receiverTokenAccount =
        //     await connection?.getTokenAccountsByOwner(receiver, {
        //       mint,
        //       programId: TOKEN_PROGRAM_ID,
        //     });
        //   if (receiverTokenAccount?.value.length === 0) {
        //     const receiverTokenAccountKey = getAssociatedTokenAddressSync(
        //       mint,
        //       receiver
        //     );
        //     tx.add(
        //       createAssociatedTokenAccountInstruction(
        //         walletAdapter.publicKey,
        //         receiverTokenAccountKey,
        //         receiver,
        //         mint
        //       )
        //     );
        //     remainingAccounts.push({
        //       pubkey: receiverTokenAccountKey,
        //       isSigner: false,
        //       isWritable: true,
        //     });
        //   } else {
        //     const receiverTokenAccountKey = receiverTokenAccount?.value[0]
        //       .pubkey as PublicKey;
        //     remainingAccounts.push({
        //       pubkey: receiverTokenAccountKey,
        //       isSigner: false,
        //       isWritable: true,
        //     });
        //   }
        // }
        // tx.add(
        //   (await program?.methods
        //     .instantDistributionFlux(
        //       new anchor.BN(amount * 10 ** decimals),
        //       basisPointsShares
        //     )
        //     .accounts({
        //       authority: walletAdapter.publicKey,
        //       authorityTokenAccount,
        //       mint,
        //     })
        //     .remainingAccounts(remainingAccounts)
        //     .signers([])
        //     .transaction()) as Transaction
        // );
        // tx.feePayer = walletAdapter.publicKey;
        const fluxus = new Fluxus(connection as Connection);
        const { transaction } = await fluxus.instantDistributionFlux(
          walletAdapter.publicKey,
          mint,
          receivers,
          amount,
          decimals,
          shares
        );
        const sig = await walletAdapter.sendTransaction(
          transaction,
          connection as Connection,
          {
            signers: [],
          }
        );
        console.log(
          "Signature:",
          getUrls(NETWORK, sig as string, "tx")?.explorer
        );
        transactionToast(sig as string, "tx");
        return sig;
      } catch (error) {
        throw error;
      }
    },
    [connection, transactionToast, walletAdapter]
  );

  useEffect(() => {
    if (fetchAccounts) {
      getAsCreatorConstantFluxAccounts().catch((error) => console.log(error));
      getAsReceiverConstantFluxAccounts().catch((error) => console.log(error));
    }
  }, [
    fetchAccounts,
    getAsCreatorConstantFluxAccounts,
    getAsReceiverConstantFluxAccounts,
  ]);

  return {
    createConstantFlux,
    cancelConstantFlux,
    claimConstantFlux,
    instantDistributionFlux,
    getAsCreatorConstantFluxAccounts,
    getAsReceiverConstantFluxAccounts,
    asCreatorConstantFluxAccounts,
    asReceiverConstantFluxAccounts,
    asCreatorConstantFluxAccountsLoading,
    asReceiverConstantFluxAccountsLoading,
  };
};

export default useFluxus;
