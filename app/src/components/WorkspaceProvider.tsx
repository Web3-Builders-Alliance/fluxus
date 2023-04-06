import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Fluxus, FLUXUS_PROGRAM_ID } from "fluxus-sdk";
import { createContext, useContext } from "react";

const WorkspaceContext = createContext({});
const programId = FLUXUS_PROGRAM_ID;

interface Workspace {
  connection?: Connection;
  provider?: AnchorProvider;
  program?: Program;
  programId?: PublicKey;
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
  const fluxus = new Fluxus(connection);
  const program = fluxus.program;

  const workspace = {
    connection,
    provider,
    program,
    programId,
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
