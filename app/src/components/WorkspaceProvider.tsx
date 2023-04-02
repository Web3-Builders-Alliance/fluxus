import idl from "@/constants/fluxus.json";
import { Fluxus, IDL } from "@/types/fluxus";
import * as anchor from "@project-serum/anchor";
import {
  AnchorProvider,
  Idl,
  Program,
  setProvider,
} from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { createContext, useContext } from "react";

const WorkspaceContext = createContext({});
const programId = new PublicKey(idl.metadata.address);

interface Workspace {
  connection?: Connection;
  provider?: AnchorProvider;
  program?: Program<Fluxus>;
  getConstantFluxPda?: (
    authority: PublicKey,
    receiver: PublicKey,
    fluxId: string
  ) => [PublicKey, number];
  getVaultPda?: (fluxId: string) => [PublicKey, number];
  getVaultAuthority?: () => [PublicKey, number];
}

const MockWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: (transaction: Transaction) => Promise.resolve(transaction),
  signAllTransactions: (transactions: Transaction[]) =>
    Promise.resolve(transactions),
};

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet;
  const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);
  const program = new Program(IDL as Idl, programId);

  const getConstantFluxPda = (
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
      program.programId
    );
  };

  const getVaultPda = (fluxId: string) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")),
        Buffer.from(fluxId),
      ],
      program.programId
    );
  };

  const getVaultAuthority = () =>
    PublicKey.findProgramAddressSync(
      [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
      program.programId
    );

  const workspace = {
    connection,
    provider,
    program,
    getConstantFluxPda,
    getVaultPda,
    getVaultAuthority,
  };
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkspace = (): Workspace => {
  return useContext(WorkspaceContext);
};

export { WorkspaceProvider, useWorkspace };
