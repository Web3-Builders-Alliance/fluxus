use crate::state::ConstantFlux;
use anchor_lang::prelude::*;
use anchor_spl::token::{CloseAccount, Mint, SetAuthority, Token, TokenAccount, Transfer};

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

#[derive(Accounts)]
#[instruction(flux_nonce: u8)]
pub struct CloseConstantFlux<'info> {
    /// authority is the creator of the flux
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: recipient wallet account
    pub recipient: AccountInfo<'info>,
    /// constant flux pda to be deleted
    #[account(
        mut,
        seeds = [
            b"constant_flux",
            authority.key().as_ref(),
            recipient.key().as_ref(),
            &[flux_nonce],
        ],
        bump,
        has_one = authority,
        close = authority,
    )]
    pub constant_flux: Account<'info, ConstantFlux>,
    /// token mint which authority wants to stream
    pub mint: Account<'info, Mint>,
    /// authority token account w.r.t mint
    #[account(
        mut,
        token::mint = mint,
        token::authority = authority,
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    /// CHECK: vault authority
    pub vault_authority: AccountInfo<'info>,
    /// vault token account that holds tokens
    #[account(
        mut,
        seeds = [b"token-seed".as_ref(), &[flux_nonce]],
        bump,
        token::mint = mint,
        token::authority = vault_authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> CloseConstantFlux<'info> {
    pub fn into_transfer_to_authority_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.authority_token_account.to_account_info(),
            authority: self.vault_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    pub fn into_close_token_account_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            authority: self.vault_authority.to_account_info(),
            destination: self.authority_token_account.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[derive(Accounts)]
#[instruction(flux_nonce: u8)]
pub struct ClaimConstantFlux<'info> {
    /// CHECK: authority is the creator of the flux
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    /// recipient wallet account
    #[account(mut)]
    pub recipient: Signer<'info>,
    /// constant flux pda
    #[account(
        mut,
        seeds = [
            b"constant_flux",
            authority.key().as_ref(),
            recipient.key().as_ref(),
            &[flux_nonce],
        ],
        bump,
        has_one = authority,
    )]
    pub constant_flux: Account<'info, ConstantFlux>,
    /// token mint which receiver wants to claim
    pub mint: Account<'info, Mint>,
    /// recipient token account w.r.t mint
    #[account(
        mut,
        token::mint = mint,
        token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    /// CHECK: vault authority
    pub vault_authority: AccountInfo<'info>,
    /// vault token account that holds tokens
    #[account(
        mut,
        seeds = [b"token-seed".as_ref(), &[flux_nonce]],
        bump,
        token::mint = mint,
        token::authority = vault_authority,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> ClaimConstantFlux<'info> {
    pub fn into_transfer_to_receiver_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.recipient_token_account.to_account_info(),
            authority: self.vault_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    pub fn into_close_constant_flux_account(&self) -> Result<()> {
        AccountsClose::close(&self.constant_flux, self.authority.to_account_info())
    }

    pub fn into_close_token_account_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            authority: self.vault_authority.to_account_info(),
            destination: self.recipient_token_account.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}
