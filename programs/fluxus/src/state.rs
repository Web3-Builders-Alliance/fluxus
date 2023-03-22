use anchor_lang::prelude::*;
use anchor_lang::Space;

#[account]
#[derive(InitSpace, Debug)]
pub struct ConstantFlux {
    // authority's wallet address who starts the flux
    pub authority: Pubkey,
    // recipient's wallet address who receives tokens
    pub recipient: Pubkey,
    // token account of authority of respective mint
    pub authority_token_account: Pubkey,
    // token account of recipient of respective mint
    pub recipient_token_account: Pubkey,
    // token mint that the authority wants to send to recipient
    pub mint: Pubkey,
    // timestamp at which flux will start
    pub start_unix_timestamp: i64,
    // timestamp at which flux will stop
    pub end_unit_timestamp: i64,
    // amount of tokens to transfer
    pub amount: u64,
}

#[derive(Debug, Default, Clone, Copy, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub struct Recipient {
    // recipient's wallet address
    pub address: Pubkey,
    // token account of recipient of respective mint
    pub token_account: Pubkey,
    // share that recipient will receive of total amount
    pub share: u16,
}

impl Space for Recipient {
    const INIT_SPACE: usize = 32 + 32 + 2;
}

#[account]
#[derive(InitSpace, Debug)]
pub struct InstantFlux {
    // authority's wallet address who starts the flux
    pub authority: Pubkey,
    // token account of authority of respective mint
    pub authority_token_account: Pubkey,
    // token mint that the authority wants to send to recipient
    pub mint: Pubkey,
    // amount of tokens to transfer
    pub total_amount: u64,
    // list of recipients
    #[max_len(5)]
    pub recipients: Vec<Recipient>,
}
