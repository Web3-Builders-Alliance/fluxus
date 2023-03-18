use crate::state::ConstantFlux;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, SetAuthority, Token, TokenAccount, Transfer};

#[derive(Accounts)]
#[instruction(amount: u64, flux_nonce: u8)]
pub struct CreateConstantFlux<'info> {
    /// authority is the creator of the flux
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: recipient wallet account
    pub recipient: AccountInfo<'info>,
    /// constant flux pda to be created
    #[account(
        init,
        seeds = [
            b"constant_flux",
            authority.key().as_ref(),
            recipient.key().as_ref(),
            &[flux_nonce],
        ],
        payer = authority,
        bump,
        space = 8 + ConstantFlux::INIT_SPACE,
    )]
    pub constant_flux: Account<'info, ConstantFlux>,
    /// token mint which authority wants to stream
    pub mint: Account<'info, Mint>,
    /// authority token account w.r.t mint
    #[account(
        mut,
        token::mint = mint,
        token::authority = authority,
        constraint = authority_token_account.amount >= amount
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    /// recipient token account w.r.t mint
    #[account(
        init_if_needed,
        payer = authority,
        token::mint = mint,
        token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    /// vault token account that holds tokens
    #[account(
        init,
        seeds = [b"token-seed".as_ref(), &[flux_nonce]],
        bump,
        payer = authority,
        token::mint = mint,
        token::authority = authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> CreateConstantFlux<'info> {
    pub fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.vault.to_account_info(),
            current_authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    pub fn into_transfer_to_vault_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.authority_token_account.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}
