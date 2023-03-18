import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";
import {
  createCreateMetadataAccountV2Instruction,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";
import * as token from "@solana/spl-token";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { getUrls, Network } from "./networks";

export const initializeMint = async (
  connection: Connection,
  payer: Keypair,
  tokenName: string,
  symbol: string,
  description: string,
  imageUri: string,
  programId?: PublicKey
) => {
  try {
    console.log(`Creating ${tokenName} token...`);
    let mintAuthority = payer.publicKey;
    if (programId) {
      const [mintAuth] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        programId
      );
      mintAuthority = mintAuth;
    }

    // Create a metaplex object so that we can create a metaplex metadata
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(
        bundlrStorage({
          address: getUrls(Network[connection.rpcEndpoint]).bundlrAddress,
          providerUrl: getUrls(Network[connection.rpcEndpoint])
            .bundlrProviderUrl,
          timeout: 60000,
        })
      );

    console.log("Image URI:", imageUri);
    // Upload the rest of off-chain metadata
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: tokenName,
      description,
      image: imageUri,
    });
    console.log("Metadata URI:", uri);

    // This will create a token with all the necessary inputs
    const {
      mint: { address: tokenMint },
    } = await metaplex.tokens().createMint({ decimals: 9 });

    // Finding out the address where the metadata is stored
    const metadataPda = metaplex.nfts().pdas().metadata({ mint: tokenMint });
    const tokenMetadata = {
      name: tokenName,
      symbol,
      uri: uri,
      sellerFeeBasisPoints: 0,
      creators: [{ address: payer.publicKey, share: 100, verified: true }],
      collection: null,
      uses: null,
    } as DataV2;

    const instruction = createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPda,
        mint: tokenMint,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    );

    const transaction = new Transaction();
    transaction.add(instruction);

    const sig = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);

    if (programId) {
      await token.setAuthority(
        connection,
        payer,
        tokenMint,
        payer.publicKey,
        token.AuthorityType.MintTokens,
        mintAuthority
      );
    }

    console.log(
      "Signature:",
      getUrls(Network[connection.rpcEndpoint], sig, "tx").explorer
    );
    console.log(`${tokenName}: `, tokenMint.toBase58());
    return {
      mint: tokenMint,
      imageUri: imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPda,
      metadataTransaction: sig,
    };
  } catch (error) {
    throw error;
  }
};

export const mintTokens = async (
  connection: Connection,
  mint: PublicKey,
  receiver: PublicKey,
  payer: Keypair,
  authority: Keypair,
  amount: number
) => {
  try {
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(
        bundlrStorage({
          address: getUrls(Network[connection.rpcEndpoint]).bundlrAddress,
          providerUrl: getUrls(Network[connection.rpcEndpoint])
            .bundlrProviderUrl,
          timeout: 60000,
        })
      );
    const tokenMint = await metaplex
      .tokens()
      .findMintByAddress({ address: mint });
    console.log(`Minting ${amount} tokens to ${tokenMint.address.toBase58()}`);
    const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      receiver
    );
    const sig = await mintTo(
      connection,
      payer,
      tokenMint.address,
      receiverTokenAccount.address,
      authority,
      amount * 10 ** tokenMint.decimals
    );
    console.log(
      "Signature:",
      getUrls(Network[connection.rpcEndpoint], sig, "tx").explorer
    );
  } catch (error) {
    throw error;
  }
};
