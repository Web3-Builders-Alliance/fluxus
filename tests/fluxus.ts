import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { initializeKeypair } from "../scripts/initializeKeypair";
import { getUrls, Network } from "../scripts/networks";
import { initializeMint, mintTokens } from "../scripts/splToken";
import { Fluxus } from "../target/types/fluxus";
import { execSync } from "child_process";
import { sleep } from "../scripts";

describe("fluxus", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Fluxus as Program<Fluxus>;

  let mint: PublicKey;
  let vault: PublicKey;
  let receiverTokenAccount: Keypair;

  execSync(
    `anchor idl init --filepath target/idl/fluxus.json ${program.programId}`,
    { stdio: "inherit" }
  );

  it("Initialize Mint:", async () => {
    try {
      const admin = await initializeKeypair(
        program.provider.connection,
        "fluxus"
      );
      const { mint: _mint } = await initializeMint(
        program.provider.connection,
        admin,
        "Fluxus",
        "FXS",
        "Fluxus is the payment streaming service.",
        "https://cdn.discordapp.com/attachments/1076555204763324447/1086732336948838590/fluxus.png"
      );
      mint = _mint;
    } catch (error) {
      assert.fail(error);
    }
  });

  it("Mint 100 Fluxus:", async () => {
    try {
      const admin = await initializeKeypair(
        program.provider.connection,
        "fluxus"
      );
      const user = await initializeKeypair(
        program.provider.connection,
        "saicharan"
      );
      await mintTokens(
        program.provider.connection,
        mint,
        user.publicKey,
        user,
        admin,
        100
      );
    } catch (error) {
      assert.fail(error);
    }
  });

  it("Create Constant Flux - 1:", async () => {
    try {
      const authority = await initializeKeypair(
        program.provider.connection,
        "saicharan"
      );
      const receiver = await initializeKeypair(
        program.provider.connection,
        "receiver"
      );
      const [constantFlux] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("constant_flux")),
          authority.publicKey.toBuffer(),
          receiver.publicKey.toBuffer(),
          Buffer.from([1]),
        ],
        program.programId
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority.publicKey
      );
      receiverTokenAccount = anchor.web3.Keypair.generate();
      const [_vault, _vaultBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")),
          Buffer.from([1]),
        ],
        program.programId
      );
      vault = _vault;
      const sig = await program.methods
        .createConstantFlux(new anchor.BN(20 * 10 ** 9), 1, 2)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux: constantFlux,
          mint: mint,
          authorityTokenAccount,
          recipientTokenAccount: receiverTokenAccount.publicKey,
          vault,
        })
        .signers([authority, receiverTokenAccount])
        .rpc();
      console.log(
        "Signature:",
        getUrls(Network[program.provider.connection.rpcEndpoint], sig, "tx")
          .explorer
      );
      const fetchedData = await program.account.constantFlux.fetch(
        constantFlux
      );
      console.log(fetchedData);
    } catch (error) {
      assert.fail(error);
    }
  });

  it("Create Constant Flux - 2:", async () => {
    try {
      const authority = await initializeKeypair(
        program.provider.connection,
        "saicharan"
      );
      const receiver = await initializeKeypair(
        program.provider.connection,
        "receiver"
      );
      const [constantFlux] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("constant_flux")),
          authority.publicKey.toBuffer(),
          receiver.publicKey.toBuffer(),
          Buffer.from([2]),
        ],
        program.programId
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority.publicKey
      );
      const [vault, _vaultBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")),
          Buffer.from([2]),
        ],
        program.programId
      );
      const sig = await program.methods
        .createConstantFlux(new anchor.BN(20 * 10 ** 9), 2, 2)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux: constantFlux,
          mint: mint,
          authorityTokenAccount,
          recipientTokenAccount: receiverTokenAccount.publicKey,
          vault,
        })
        .signers([authority, receiverTokenAccount])
        .rpc();
      console.log(
        "Signature:",
        getUrls(Network[program.provider.connection.rpcEndpoint], sig, "tx")
          .explorer
      );
      const fetchedData = await program.account.constantFlux.fetch(
        constantFlux
      );
      console.log(fetchedData);
    } catch (error) {
      assert.fail(error);
    }
  });

  it("Close Constant Flux - 2:", async () => {
    try {
      const authority = await initializeKeypair(
        program.provider.connection,
        "saicharan"
      );
      const receiver = await initializeKeypair(
        program.provider.connection,
        "receiver"
      );
      const [constantFlux] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("constant_flux")),
          authority.publicKey.toBuffer(),
          receiver.publicKey.toBuffer(),
          Buffer.from([2]),
        ],
        program.programId
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority.publicKey
      );
      const [vault, _vaultBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")),
          Buffer.from([2]),
        ],
        program.programId
      );
      const [vaultAuthority, _vaultAuthority] =
        PublicKey.findProgramAddressSync(
          [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
          program.programId
        );
      const sig = await program.methods
        .closeConstantFlux(2)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux: constantFlux,
          mint: mint,
          authorityTokenAccount,
          vault,
          vaultAuthority,
        })
        .signers([authority])
        .rpc();
      console.log(
        "Signature:",
        getUrls(Network[program.provider.connection.rpcEndpoint], sig, "tx")
          .explorer
      );
      await program.account.constantFlux.fetch(constantFlux);
      assert.fail("Shouldn't have came through!");
    } catch (error) {
      if (error.message.includes("Account does not exist")) {
        assert(true);
      } else {
        console.log(error);
      }
    }
  });

  it("Claim Constant Flux - 1:", async () => {
    try {
      await sleep(500);
      const authority = await initializeKeypair(
        program.provider.connection,
        "saicharan"
      );
      const receiver = await initializeKeypair(
        program.provider.connection,
        "receiver"
      );
      const [constantFlux] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("constant_flux")),
          authority.publicKey.toBuffer(),
          receiver.publicKey.toBuffer(),
          Buffer.from([1]),
        ],
        program.programId
      );
      const [vaultAuthority, _vaultAuthority] =
        PublicKey.findProgramAddressSync(
          [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
          program.programId
        );
      const sig = await program.methods
        .claimConstantFlux(1)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux,
          mint,
          recipientTokenAccount: receiverTokenAccount.publicKey,
          vaultAuthority,
          vault,
        })
        .signers([receiver])
        .rpc();
      console.log(
        "Signature:",
        getUrls(Network[program.provider.connection.rpcEndpoint], sig, "tx")
          .explorer
      );
      const fetchedData = await program.account.constantFlux.fetch(
        constantFlux
      );
      console.log(fetchedData);
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });
});
