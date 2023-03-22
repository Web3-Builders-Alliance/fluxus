mod account;
mod error;
mod state;

use crate::account::*;
use crate::error::FluxusErrors;
use crate::state::Recipient;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token;
use anchor_spl::token::{spl_token::instruction::AuthorityType, TokenAccount, Transfer};

declare_id!("4XvNtZ1Z9GZ5YyZDJaAxC5TSFGHx1McbL5G2YphGQ1EG");

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

    pub fn claim_constant_flux(ctx: Context<ClaimConstantFlux>, _flux_nonce: u8) -> Result<()> {
        let vault = ctx.accounts.vault.clone();
        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[VAULT_AUTHORITY_SEED], ctx.program_id);
        let authority_seeds = &[&VAULT_AUTHORITY_SEED[..], &[vault_authority_bump]];
        let constant_flux = ctx.accounts.constant_flux.clone();
        let start_unix_timestamp = constant_flux.start_unix_timestamp;
        let end_unix_timestamp = constant_flux.end_unit_timestamp;
        let current_amount = constant_flux.amount;
        let current_unix_timestamp = Clock::get().unwrap().unix_timestamp;
        // let mock_current_unix_timestamp = current_unix_timestamp + (3 * 24 * 60 * 60);
        // if mock_current_unix_timestamp >= end_unix_timestamp {
        if current_unix_timestamp >= end_unix_timestamp {
            token::transfer(
                ctx.accounts
                    .into_transfer_to_receiver_context()
                    .with_signer(&[&authority_seeds[..]]),
                vault.amount,
            )?;
            ctx.accounts.into_close_constant_flux_account()?;
            token::close_account(
                ctx.accounts
                    .into_close_token_account_context()
                    .with_signer(&[&authority_seeds[..]]),
            )?;
        } else {
            // using start_unix_timestamp, end_unix_timestamp & current_unix_timestamp calculate elapsed timestamp in basis point percent
            let elapsed_time = current_unix_timestamp
                .checked_sub(start_unix_timestamp)
                .unwrap();
            let total_time = end_unix_timestamp
                .checked_sub(start_unix_timestamp)
                .unwrap();
            let elapsed_percent = elapsed_time
                .checked_mul(10_000)
                .unwrap()
                .checked_div(total_time)
                .unwrap();
            let streamable_tokens = vault
                .amount
                .checked_div(10_000)
                .unwrap()
                .checked_mul(elapsed_percent as u64)
                // .checked_mul(2_300)
                .unwrap();
            let remaining_tokens = current_amount - streamable_tokens;
            token::transfer(
                ctx.accounts
                    .into_transfer_to_receiver_context()
                    .with_signer(&[&authority_seeds[..]]),
                streamable_tokens,
            )?;
            ctx.accounts.constant_flux.amount = remaining_tokens;
        }
        Ok(())
    }

    pub fn create_instant_flux<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateInstantFlux<'info>>,
        amount: u64,
        _flux_nonce: u8,
        shares: Vec<u16>,
    ) -> Result<()> {
        let total_shares: u16 = shares.iter().sum();
        require!(total_shares == 10000, FluxusErrors::InvalidShares);
        let instant_flux = &mut ctx.accounts.instant_flux;
        instant_flux.authority = ctx.accounts.authority.key();
        instant_flux.authority_token_account = ctx.accounts.authority_token_account.clone().key();
        instant_flux.mint = ctx.accounts.mint.key();
        instant_flux.total_amount = amount;
        let remaining_accounts = &mut ctx.remaining_accounts.into_iter();
        let remaining_account_count = remaining_accounts.len();
        require!(
            remaining_account_count / 2 == shares.len(),
            FluxusErrors::InvalidLength
        );
        let remaining_accounts: Vec<&AccountInfo> = ctx.remaining_accounts.into_iter().collect();
        let recipient_count = shares.len();
        for i in 0..recipient_count {
            let recipient = remaining_accounts[i*2];
            let recipient_token_account = remaining_accounts[i*2 + 1];
            let share = shares[i];
            require!(
                recipient.owner.key() == system_program::ID,
                FluxusErrors::InvalidOwner
            );
            require!(recipient_token_account.owner.key() == token::ID, FluxusErrors::InvalidOwner);
            let recipient_token_account_data = TokenAccount::try_deserialize_unchecked(&mut recipient_token_account.data.borrow_mut().as_ref())?;
            require!(recipient_token_account_data.mint == ctx.accounts.mint.key(), FluxusErrors::InvalidMint);
            require!(recipient_token_account_data.owner == recipient.key(), FluxusErrors::InvalidAuthority);
            instant_flux.recipients.push(Recipient {
                address: recipient.key(),
                token_account: recipient_token_account.key(),
                share,
            });
            let cpi_accounts = Transfer {
                from: ctx.accounts.authority_token_account.to_account_info(),
                to: recipient_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };
            let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
            let transferable_amount = amount.checked_div(10_000).unwrap().checked_mul(u64::from(share)).unwrap();
            token::transfer(cpi_context, transferable_amount)?;
        }
        Ok(())
    }
}
