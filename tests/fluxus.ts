import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
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
  let receiverTokenAccount: PublicKey;

  // execSync(
  //   `anchor idl init --filepath target/idl/fluxus.json ${program.programId}`,
  //   { stdio: "inherit" }
  // );

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

  it("Mint 1B Fluxus:", async () => {
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
        new PublicKey("cjB6FsoexZ9uqXjqiUcr42rgXDdMfBixwcuUoUn6YNY"),
        user,
        admin,
        1000000000
      );
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });

  xit("Create Constant Flux - 1:", async () => {
    try {
      const fluxId = "flux_id_1";
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
          Buffer.from(fluxId),
        ],
        program.programId
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority.publicKey
      );
      // receiverTokenAccount = anchor.web3.Keypair.generate();
      receiverTokenAccount = (
        await getOrCreateAssociatedTokenAccount(
          program.provider.connection,
          receiver,
          mint,
          receiver.publicKey
        )
      ).address;
      const [_vault, _vaultBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("token-seed")),
          Buffer.from(fluxId),
        ],
        program.programId
      );
      vault = _vault;
      const sig = await program.methods
        .createConstantFlux(new anchor.BN(20 * 10 ** 9), fluxId, 2)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux: constantFlux,
          mint: mint,
          authorityTokenAccount,
          recipientTokenAccount: receiverTokenAccount,
          vault,
        })
        .signers([authority])
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

  xit("Create Constant Flux - 2:", async () => {
    try {
      const fluxId = "flux_id_2";
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
          Buffer.from(fluxId),
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
          Buffer.from(fluxId),
        ],
        program.programId
      );
      const sig = await program.methods
        .createConstantFlux(new anchor.BN(20 * 10 ** 9), fluxId, 2)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux: constantFlux,
          mint: mint,
          authorityTokenAccount,
          recipientTokenAccount: receiverTokenAccount,
          vault,
        })
        .signers([authority])
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

  xit("Close Constant Flux - 2:", async () => {
    try {
      const fluxId = "flux_id_2";
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
          Buffer.from(fluxId),
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
          Buffer.from(fluxId),
        ],
        program.programId
      );
      const [vaultAuthority, _vaultAuthority] =
        PublicKey.findProgramAddressSync(
          [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
          program.programId
        );
      const sig = await program.methods
        .closeConstantFlux(fluxId)
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

  xit("Claim Constant Flux - 1:", async () => {
    try {
      const fluxId = "flux_id_1";
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
          Buffer.from(fluxId),
        ],
        program.programId
      );
      const [vaultAuthority, _vaultAuthority] =
        PublicKey.findProgramAddressSync(
          [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
          program.programId
        );
      const sig = await program.methods
        .claimConstantFlux(fluxId)
        .accounts({
          authority: authority.publicKey,
          recipient: receiver.publicKey,
          constantFlux,
          mint,
          recipientTokenAccount: receiverTokenAccount,
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

  // it("Create Instant Flux", async () => {
  //   try {
  //     const authority = await initializeKeypair(
  //       program.provider.connection,
  //       "saicharan"
  //     );
  //     const receiver = await initializeKeypair(
  //       program.provider.connection,
  //       "receiver"
  //     );
  //     const receiver2 = await initializeKeypair(
  //       program.provider.connection,
  //       "receiver2"
  //     );
  //     const [instantFlux] = anchor.web3.PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from(anchor.utils.bytes.utf8.encode("instant_flux")),
  //         authority.publicKey.toBuffer(),
  //         Buffer.from([1]),
  //       ],
  //       program.programId
  //     );
  //     const authorityTokenAccount = getAssociatedTokenAddressSync(
  //       mint,
  //       authority.publicKey
  //     );
  //     const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
  //       program.provider.connection,
  //       receiver,
  //       mint,
  //       receiver.publicKey
  //     );
  //     const receiver2TokenAccount = await getOrCreateAssociatedTokenAccount(
  //       program.provider.connection,
  //       receiver2,
  //       mint,
  //       receiver2.publicKey
  //     );
  //     const sig = await program.methods
  //       .createInstantFlux(new anchor.BN(20 * 10 ** 9), 1, [3000, 7000])
  //       .accounts({
  //         authority: authority.publicKey,
  //         instantFlux,
  //         authorityTokenAccount,
  //         mint,
  //       })
  //       .remainingAccounts([
  //         {
  //           pubkey: receiver.publicKey,
  //           isSigner: false,
  //           isWritable: false,
  //         },
  //         {
  //           pubkey: receiverTokenAccount.address,
  //           isSigner: false,
  //           isWritable: true,
  //         },
  //         {
  //           pubkey: receiver2.publicKey,
  //           isSigner: false,
  //           isWritable: false,
  //         },
  //         {
  //           // pubkey: authorityTokenAccount,
  //           pubkey: receiver2TokenAccount.address,
  //           isSigner: false,
  //           isWritable: true,
  //         },
  //       ])
  //       .signers([authority])
  //       .rpc();
  //     console.log(
  //       "Signature:",
  //       getUrls(Network[program.provider.connection.rpcEndpoint], sig, "tx")
  //         .explorer
  //     );
  //     const fetchedData = await program.account.instantFlux.fetch(instantFlux);
  //     console.log(fetchedData);
  //   } catch (error) {
  //     console.log(error);
  //     assert.fail(error);
  //   }
  // });

  xit("Instant Distribution Flux", async () => {
    try {
      const authority = await initializeKeypair(
        program.provider.connection,
        "saicharan"
      );
      const receiver = await initializeKeypair(
        program.provider.connection,
        "receiver"
      );
      const receiver2 = await initializeKeypair(
        program.provider.connection,
        "receiver2"
      );
      const receiver3 = await initializeKeypair(
        program.provider.connection,
        "receiver3"
      );
      const receiver4 = await initializeKeypair(
        program.provider.connection,
        "receiver4"
      );
      const receiver5 = await initializeKeypair(
        program.provider.connection,
        "receiver5"
      );
      const authorityTokenAccount = getAssociatedTokenAddressSync(
        mint,
        authority.publicKey
      );
      const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        receiver,
        mint,
        receiver.publicKey
      );
      const receiver2TokenAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        receiver2,
        mint,
        receiver2.publicKey
      );
      const receiver3TokenAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        receiver3,
        mint,
        receiver3.publicKey
      );
      const receiver4TokenAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        receiver4,
        mint,
        receiver4.publicKey
      );
      const receiver5TokenAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        receiver5,
        mint,
        receiver5.publicKey
      );
      const sig = await program.methods
        .instantDistributionFlux(
          new anchor.BN(20 * 10 ** 9),
          [2000, 2000, 2100, 2400, 1500]
        )
        .accounts({
          authority: authority.publicKey,
          authorityTokenAccount,
          mint,
        })
        .remainingAccounts([
          {
            pubkey: receiver.publicKey,
            isSigner: false,
            isWritable: false,
          },
          {
            // pubkey: authorityTokenAccount,
            pubkey: receiverTokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: receiver2.publicKey,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: receiver2TokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: receiver3.publicKey,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: receiver3TokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: receiver4.publicKey,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: receiver4TokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: receiver5.publicKey,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: receiver5TokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
        ])
        .signers([authority])
        .rpc();
      console.log(
        "Signature:",

        getUrls(Network[program.provider.connection.rpcEndpoint], sig, "tx")
          .explorer
      );
    } catch (error) {
      console.log(error);
      assert.fail(error);
    }
  });
});
