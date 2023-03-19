mod account;
mod error;
mod state;

use crate::account::*;
use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::spl_token::instruction::AuthorityType;

declare_id!("GYdBrTgUFvAfdgYVNK3bUudrMoaFQ6CjvRCaA7SMfMj8");

#[program]
pub mod fluxus {

    use super::*;

    const VAULT_AUTHORITY_SEED: &[u8] = b"escrow";

    pub fn create_constant_flux(
        ctx: Context<CreateConstantFlux>,
        amount: u64,
        _flux_nonce: u8,
        days: u32,
    ) -> Result<()> {
        let constant_flux = &mut ctx.accounts.constant_flux;
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        constant_flux.authority = ctx.accounts.authority.key();
        constant_flux.recipient = ctx.accounts.recipient.key();
        constant_flux.authority_token_account = ctx.accounts.authority_token_account.key();
        constant_flux.recipient_token_account = ctx.accounts.recipient_token_account.key();
        constant_flux.mint = ctx.accounts.mint.key();
        constant_flux.start_unix_timestamp = now;
        constant_flux.end_unit_timestamp = (i64::from(days) * 24 * 60 * 60) + now;
        constant_flux.amount = amount;
        msg!("{:?}", constant_flux);
        let (vault_authority, _vault_authority_bump) =
            Pubkey::find_program_address(&[VAULT_AUTHORITY_SEED], ctx.program_id);
        token::set_authority(
            ctx.accounts.into_set_authority_context(),
            AuthorityType::AccountOwner,
            Some(vault_authority),
        )?;
        token::transfer(
            ctx.accounts.into_transfer_to_vault_context(),
            ctx.accounts.constant_flux.amount,
        )?;
        Ok(())
    }

    pub fn close_constant_flux(ctx: Context<CloseConstantFlux>, _flux_nonce: u8) -> Result<()> {
        let accounts = ctx.accounts;
        let vault = &mut accounts.vault.clone();
        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[VAULT_AUTHORITY_SEED], ctx.program_id);
        let authority_seeds = &[&VAULT_AUTHORITY_SEED[..], &[vault_authority_bump]];
        token::transfer(
            accounts
                .into_transfer_to_authority_context()
                .with_signer(&[&authority_seeds[..]]),
            vault.amount,
        )?;
        token::close_account(
            accounts
                .into_close_token_account_context()
                .with_signer(&[&authority_seeds[..]]),
        )?;
        Ok(())
    }
}
