import idl from "./idl/fluxus.json";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Fluxus as FluxusProgram, IDL } from "./types/fluxus";

export const FLUXUS_PROGRAM_ID = new PublicKey(idl.metadata.address);

interface ConstantFluxAccount {
  authority: PublicKey;
  recipient: PublicKey;
  constantFlux: PublicKey;
  mint: PublicKey;
  authorityTokenAccount: PublicKey;
  receiverTokenAccount: PublicKey;
  vault: PublicKey;
}

interface ConstantFluxTransactionReturnType {
  transaction: Transaction;
  account: ConstantFluxAccount;
}

interface ConstantFluxSignatureReturnType {
  signature: string;
  account: ConstantFluxAccount;
}

export class Wallet {
  payer: Keypair;

  constructor(payer: Keypair) {
    this.payer = payer;
  }

  async signTransaction(transaction: Transaction) {
    transaction.partialSign(this.payer);
    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]) {
    return transactions.map((tx) => {
      tx.partialSign(this.payer);
      return tx;
    });
  }

  get publicKey() {
    return this.payer.publicKey;
  }
}

const MockWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: (transaction: Transaction) => Promise.resolve(transaction),
  signAllTransactions: (transactions: Transaction[]) =>
    Promise.resolve(transactions),
};

export class Fluxus {
  connection: Connection;
  program: Program;

  constructor(connection: Connection) {
    this.connection = connection;
    const provider = new anchor.AnchorProvider(
      connection,
      MockWallet as Wallet,
      {}
    );
    anchor.setProvider(provider);
    this.program = new Program(IDL as anchor.Idl, FLUXUS_PROGRAM_ID);
  }

  static getConstantFluxPda = (
    authority: PublicKey,
    receiver: PublicKey,
    fluxId: string
  ) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("constant_flux")),
        authority.toBuffer(),
        receiver.toBuffer(),
        Buffer.from(fluxId),
      ],
      FLUXUS_PROGRAM_ID
    );
  };

  static getVaultPda = (fluxId: string) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")),
        Buffer.from(fluxId),
      ],
      FLUXUS_PROGRAM_ID
    );
  };

  static getVaultAuthority = () =>
    PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
      FLUXUS_PROGRAM_ID
    );

  async createConstantFlux(
    authority: PublicKey,
    mint: PublicKey,
    receiver: PublicKey,
    fluxId: string,
    amount: number,
    decimals: number,
    days: number
  ): Promise<ConstantFluxTransactionReturnType> {
    try {
      const [constantFlux] = Fluxus.getConstantFluxPda(
        authority,
        receiver,
        fluxId
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority
      );
      const [vault] = Fluxus.getVaultPda(fluxId);
      const receiverTokenAccountInfo =
        await this.connection.getTokenAccountsByOwner(receiver, {
          mint,
          programId: TOKEN_PROGRAM_ID,
        });
      const receiverTokenAccountKey = getAssociatedTokenAddressSync(
        mint,
        receiver
      );
      const recentBlockhash = await this.connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: recentBlockhash?.blockhash,
      });
      if (receiverTokenAccountInfo?.value.length === 0) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            authority,
            receiverTokenAccountKey,
            receiver,
            mint
          )
        );
      }
      tx.add(
        (await this.program.methods
          .createConstantFlux(
            new anchor.BN(amount * 10 ** decimals),
            fluxId,
            days
          )
          .accounts({
            authority: authority,
            recipient: receiver,
            constantFlux: constantFlux,
            mint: mint,
            authorityTokenAccount,
            recipientTokenAccount: receiverTokenAccountKey,
            vault,
          })
          .signers([])
          .transaction()) as Transaction
      );
      tx.feePayer = authority;
      return {
        transaction: tx,
        account: {
          authority: authority,
          recipient: receiver,
          constantFlux: constantFlux,
          mint: mint,
          authorityTokenAccount: authorityTokenAccount,
          receiverTokenAccount: receiverTokenAccountKey,
          vault: vault,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async cancelConstantFlux(
    authority: PublicKey,
    mint: PublicKey,
    receiver: PublicKey,
    fluxId: string
  ) {
    try {
      const [constantFlux] = Fluxus.getConstantFluxPda(
        authority,
        receiver,
        fluxId
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority
      );
      const [vault] = Fluxus.getVaultPda(fluxId);
      const [vaultAuthority] = Fluxus.getVaultAuthority();
      const recentBlockhash = await this.connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: recentBlockhash?.blockhash,
      });
      tx.add(
        (await this.program.methods
          .closeConstantFlux(fluxId)
          .accounts({
            authority: authority,
            recipient: receiver,
            constantFlux: constantFlux,
            mint: mint,
            authorityTokenAccount,
            vault,
            vaultAuthority,
          })
          .signers([])
          .transaction()) as Transaction
      );
      tx.feePayer = authority;
      return { transaction: tx };
    } catch (error) {
      throw error;
    }
  }

  async claimConstantFlux(
    mint: PublicKey,
    authority: PublicKey,
    receiver: PublicKey,
    fluxId: string,
    receiverTokenAccount: PublicKey
  ) {
    try {
      const [constantFlux] = Fluxus.getConstantFluxPda(
        authority,
        receiver,
        fluxId
      );
      const [vault] = Fluxus.getVaultPda(fluxId);
      const [vaultAuthority] = Fluxus.getVaultAuthority();
      const recentBlockhash = await this.connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: recentBlockhash?.blockhash,
      });
      tx.add(
        (await this.program.methods
          .claimConstantFlux(fluxId)
          .accounts({
            authority,
            recipient: receiver,
            constantFlux,
            mint,
            recipientTokenAccount: receiverTokenAccount,
            vaultAuthority,
            vault,
          })
          .signers([])
          .transaction()) as Transaction
      );
      tx.feePayer = receiver;
      return { transaction: tx };
    } catch (error: any) {
      console.log(error.error);
      throw error;
    }
  }

  async instantDistributionFlux(
    authority: PublicKey,
    mint: PublicKey,
    receivers: PublicKey[],
    amount: number,
    decimals: number,
    shares: number[]
  ) {
    try {
      const basisPointsShares = shares.map((share) => share * 100);
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority
      );
      let remainingAccounts: {
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }[] = [];
      const recentBlockhash = await this.connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: recentBlockhash?.blockhash,
      });
      for await (let receiver of receivers) {
        remainingAccounts.push({
          pubkey: receiver,
          isSigner: false,
          isWritable: false,
        });
        const receiverTokenAccount =
          await this.connection.getTokenAccountsByOwner(receiver, {
            mint,
            programId: TOKEN_PROGRAM_ID,
          });
        if (receiverTokenAccount?.value.length === 0) {
          const receiverTokenAccountKey = getAssociatedTokenAddressSync(
            mint,
            receiver
          );
          tx.add(
            createAssociatedTokenAccountInstruction(
              authority,
              receiverTokenAccountKey,
              receiver,
              mint
            )
          );
          remainingAccounts.push({
            pubkey: receiverTokenAccountKey,
            isSigner: false,
            isWritable: true,
          });
        } else {
          const receiverTokenAccountKey = receiverTokenAccount?.value[0]
            .pubkey as PublicKey;
          remainingAccounts.push({
            pubkey: receiverTokenAccountKey,
            isSigner: false,
            isWritable: true,
          });
        }
      }
      tx.add(
        (await this.program.methods
          .instantDistributionFlux(
            new anchor.BN(amount * 10 ** decimals),
            basisPointsShares
          )
          .accounts({
            authority: authority,
            authorityTokenAccount,
            mint,
          })
          .remainingAccounts(remainingAccounts)
          .signers([])
          .transaction()) as Transaction
      );
      tx.feePayer = authority;
      return { transaction: tx };
    } catch (error) {
      throw error;
    }
  }
}

export class FluxusWithWallet extends Fluxus {
  wallet: Wallet;
  payer: Keypair;

  constructor(connection: Connection, payer: Keypair) {
    super(connection);
    this.payer = payer;
    const wallet = {
      publicKey: payer.publicKey,
      signTransaction: (transaction: Transaction) =>
        Promise.resolve(transaction),
      signAllTransactions: (transactions: Transaction[]) =>
        Promise.resolve(transactions),
    } as Wallet;
    this.wallet = wallet;
    this.connection = connection;
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    this.program = new Program(IDL as anchor.Idl, FLUXUS_PROGRAM_ID);
  }

  async createConstantFluxWithWallet(
    authority: PublicKey,
    mint: PublicKey,
    receiver: PublicKey,
    fluxId: string,
    amount: number,
    decimals: number,
    days: number
  ): Promise<ConstantFluxSignatureReturnType> {
    try {
      if (!this.wallet) {
        throw new Error("Wallet not provided.");
      }
      const { transaction, account } = await super.createConstantFlux(
        authority,
        mint,
        receiver,
        fluxId,
        amount,
        decimals,
        days
      );
      let signature: string = "";
      if (this.wallet) {
        const signedTx = await this.wallet?.signTransaction(transaction);
        signature = await sendAndConfirmTransaction(
          this.connection,
          signedTx as Transaction,
          [this.payer],
          {}
        );
      }
      return { signature, account };
    } catch (error) {
      throw error;
    }
  }

  async cancelConstantFluxWithWallet(
    authority: PublicKey,
    mint: PublicKey,
    receiver: PublicKey,
    fluxId: string
  ) {
    try {
      const { transaction } = await super.cancelConstantFlux(
        authority,
        mint,
        receiver,
        fluxId
      );
      let signature = "";
      if (this.wallet) {
        const signedTx = await this.wallet.signTransaction(transaction);
        signature = await sendAndConfirmTransaction(
          this.connection,
          signedTx,
          [this.payer],
          {}
        );
      }
      return { signature };
    } catch (error) {
      throw error;
    }
  }

  async claimConstantFluxWithWallet(
    mint: PublicKey,
    authority: PublicKey,
    receiver: PublicKey,
    fluxId: string,
    receiverTokenAccount: PublicKey
  ) {
    try {
      const { transaction } = await super.claimConstantFlux(
        mint,
        authority,
        receiver,
        fluxId,
        receiverTokenAccount
      );
      let signature = "";
      if (this.wallet) {
        const signedTx = await this.wallet.signTransaction(transaction);
        signature = await sendAndConfirmTransaction(
          this.connection,
          signedTx,
          [this.payer],
          {}
        );
      }
      return { signature };
    } catch (error: any) {
      console.log(error.error);
      throw error;
    }
  }

  async instantDistributionFluxWithWallet(
    authority: PublicKey,
    mint: PublicKey,
    receivers: PublicKey[],
    amount: number,
    decimals: number,
    shares: number[]
  ) {
    try {
      const { transaction } = await super.instantDistributionFlux(
        authority,
        mint,
        receivers,
        amount,
        decimals,
        shares
      );
      let signature = "";
      if (this.wallet) {
        const signedTx = await this.wallet.signTransaction(transaction);
        signature = await sendAndConfirmTransaction(
          this.connection,
          signedTx,
          [this.payer],
          {}
        );
      }
      return { signature };
    } catch (error) {
      throw error;
    }
  }
}
