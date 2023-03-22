use anchor_lang::prelude::*;

#[error_code]
pub enum FluxusErrors {
    #[msg("Invalid shares/recipient/recipient_token_account length")]
    InvalidLength,
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Invalid shares total")]
    InvalidShares,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Recipients limit exceeded")]
    RecipientsLimitExceeded,
}
