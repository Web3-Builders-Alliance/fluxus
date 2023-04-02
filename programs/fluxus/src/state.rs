use anchor_lang::prelude::*;
// use anchor_lang::Space;

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
    pub end_unix_timestamp: i64,
    // timestamp at which flux was updated
    pub last_updated_unix_timestamp: i64,
    // total amount of tokens to be transferred
    pub total_amount: u64,
    // remaining amount of token to be transferred
    pub streamable_amount: u64,
}
