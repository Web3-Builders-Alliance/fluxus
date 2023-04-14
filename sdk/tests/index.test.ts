import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { sleep } from "../../scripts";
import { initializeKeypair } from "../../scripts/initializeKeypair";
import { getUrls, Network } from "../../scripts/networks";
import { initializeMint, mintTokens } from "../../scripts/splToken";
import { FluxusWithWallet, Wallet } from "../lib";

describe("Test FluxusWithWallet", () => {
  const connection = new Connection("http://localhost:8899");
  let payer: Keypair;
  let wallet: Wallet;
  let fluxus: FluxusWithWallet;

  let mint: PublicKey;
  let constantFlux: PublicKey;
  let vault: PublicKey;
  let receiverTokenAccount: PublicKey;
  const fluxId = "flux_id_1";

  before(async () => {
    payer = await initializeKeypair(connection, "saicharan");
    wallet = new Wallet(payer);
    fluxus = new FluxusWithWallet(connection, payer);
  });

  it("Initialize Mint:", async () => {
    try {
      const admin = await initializeKeypair(connection, "fluxus");
      const { mint: _mint } = await initializeMint(
        connection,
        admin,
        "Fluxus",
        "FXS",
        9,
        "Fluxus is the payment streaming service.",
        "https://cdn.discordapp.com/attachments/1076555204763324447/1086732336948838590/fluxus.png"
      );
      mint = _mint;
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });

  it("Mint 1M Fluxus:", async () => {
    try {
      const admin = await initializeKeypair(connection, "fluxus");
      const user = await initializeKeypair(connection, "saicharan");
      await mintTokens(connection, mint, user.publicKey, user, admin, 1000000);
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });

  it("createConstantFluxWithWallet:", async () => {
    try {
      const receiver = await initializeKeypair(connection, "receiver");
      const { signature, account } = await fluxus.createConstantFluxWithWallet(
        wallet.publicKey,
        mint,
        receiver.publicKey,
        fluxId,
        100,
        9,
        1
      );
      const {
        receiverTokenAccount: _receiverTokenAccount,
        constantFlux: _constantFlux,
      } = account;
      receiverTokenAccount = _receiverTokenAccount;
      constantFlux = _constantFlux;
      console.log(
        "Signature:",
        getUrls(Network[connection.rpcEndpoint], signature, "tx").explorer
      );
      const fetchedData = await fluxus.program.account.constantFlux.fetch(
        constantFlux
      );
      console.log(fetchedData);
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });

  it("claimConstantFluxWithWallet:", async () => {
    try {
      await sleep(100);
      const receiver = await initializeKeypair(connection, "receiver");
      const _fluxus = new FluxusWithWallet(connection, receiver);
      const { signature } = await _fluxus.claimConstantFluxWithWallet(
        mint,
        wallet.publicKey,
        receiver.publicKey,
        fluxId,
        receiverTokenAccount
      );
      console.log(
        "Signature:",
        getUrls(Network[connection.rpcEndpoint], signature, "tx").explorer
      );
      const fetchedData = await _fluxus.program.account.constantFlux.fetch(
        constantFlux
      );
      console.log(fetchedData);
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });

  it("cancelConstantFluxWithWallet:", async () => {
    try {
      const receiver = await initializeKeypair(connection, "receiver");
      const { signature } = await fluxus.cancelConstantFluxWithWallet(
        wallet.publicKey,
        mint,
        receiver.publicKey,
        fluxId
      );
      console.log(
        "Signature:",
        getUrls(Network[connection.rpcEndpoint], signature, "tx").explorer
      );
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });

  it("instantDistributionFluxWithWallet:", async () => {
    try {
      const receiver = await initializeKeypair(
        fluxus.program.provider.connection,
        "receiver"
      );
      const receiver2 = await initializeKeypair(
        fluxus.program.provider.connection,
        "receiver2"
      );
      const receiver3 = await initializeKeypair(
        fluxus.program.provider.connection,
        "receiver3"
      );
      const receiver4 = await initializeKeypair(
        fluxus.program.provider.connection,
        "receiver4"
      );
      const receiver5 = await initializeKeypair(
        fluxus.program.provider.connection,
        "receiver5"
      );
      const { signature } = await fluxus.instantDistributionFluxWithWallet(
        wallet.publicKey,
        mint,
        [
          receiver.publicKey,
          receiver2.publicKey,
          receiver3.publicKey,
          receiver4.publicKey,
          receiver5.publicKey,
        ],
        100,
        9,
        [20, 20, 21, 24, 15]
      );
      console.log(
        "Signature:",
        getUrls(Network[connection.rpcEndpoint], signature, "tx").explorer
      );
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });
});
