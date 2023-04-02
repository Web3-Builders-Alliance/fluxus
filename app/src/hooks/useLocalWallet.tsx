import { Metaplex } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenListProvider } from "@solana/spl-token-registry";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  GetProgramAccountsFilter,
  PublicKey,
} from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import useMetaplex from "./useMetaplex";

const useLocalWallet = () => {
  const [balance, setBalance] = useState(0);
  const [ownedTokens, setOwnedTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const walletAdapter = useWallet();
  const { connection } = useConnection();
  const { metaplex } = useMetaplex();

  const getBalance = useCallback(async () => {
    try {
      if (!walletAdapter.connected && !walletAdapter.publicKey)
        return setBalance(0);
      const _balance = await connection.getBalance(
        walletAdapter.publicKey as PublicKey
      );
      setBalance(_balance);
    } catch (error) {
      console.log(error);
    }
  }, [connection, walletAdapter.connected, walletAdapter.publicKey]);

  const getOwnedTokens = async (
    connection: Connection,
    wallet: PublicKey,
    metaplex: Metaplex
  ) => {
    try {
      let tokenMap = new Map();
      let ownedMints: any[] = [];
      new TokenListProvider().resolve().then((tokens) => {
        const tokenList = tokens.filterByClusterSlug("devnet").getList();

        tokenMap = tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map());
      });
      const filters: GetProgramAccountsFilter[] = [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 32,
            bytes: wallet?.toBase58() as string,
          },
        },
      ];
      const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        { filters: filters }
      );
      for (let i in accounts) {
        const account = accounts[i];
        const parsedAccountInfo: any = account.account.data;
        const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
        const token = tokenMap.get(mintAddress);

        if (token) {
          const tokenAccount = await connection.getTokenAccountsByOwner(
            wallet as PublicKey,
            { mint: new PublicKey(token.address) }
          );
          const balance = await connection.getTokenAccountBalance(
            tokenAccount.value[0].pubkey
          );
          ownedMints.push({
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoURI: token.logoURI,
            balance: balance.value.uiAmount,
          });
          break;
        }

        const mxFetched = await metaplex
          .nfts()
          .findByMint({ mintAddress: new PublicKey(mintAddress) })
          .catch((e) => {});

        if (!mxFetched) {
          continue;
        }
        if (mxFetched!.mint.currency.decimals !== 0) {
          const tokenAccount = await connection.getTokenAccountsByOwner(
            wallet as PublicKey,
            { mint: new PublicKey(mxFetched!.mint.address) }
          );
          const balance = await connection.getTokenAccountBalance(
            tokenAccount.value[0].pubkey
          );
          ownedMints.push({
            mint: mxFetched?.mint?.address?.toBase58(),
            address: account.pubkey.toBase58(),
            symbol: mxFetched!.mint.currency.symbol,
            name: mxFetched!.name,
            decimals: mxFetched!.mint.currency.decimals,
            logoURI: mxFetched!.json?.image,
            balance: balance.value.uiAmount,
          });
        }
      }
      console.log(ownedMints);
      return ownedMints;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAdapter.connected && walletAdapter.publicKey) {
      getOwnedTokens(connection, walletAdapter.publicKey, metaplex)
        .then((ownedTokens) => setOwnedTokens(ownedTokens))
        .catch((error) => console.log(error));
    } else {
      setLoading(false);
    }
  }, [connection, metaplex, walletAdapter.connected, walletAdapter.publicKey]);

  return { balance, getBalance, ownedTokens, isOwnedTokensLoading: loading };
};

export default useLocalWallet;
