use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct ConstantFlux {
    // authority's wallet address who starts the contract
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
