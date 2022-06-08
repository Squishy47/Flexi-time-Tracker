use crate::borsh::maybestd::collections::HashMap;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, require};
use near_contract_standards::fungible_token::FungibleToken;

// TODO: build interface to log time based on start and end time so i don't have to work it out.
// TODO: deploy on mainnet and figure out how to deploy config in CI
// TODO: check numbers don't overflow types

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct FlexiTracker {
    flexi_time_per_epoch: i32,
    users_tokens: HashMap<AccountId, FlexiTime>,
    users_authorized_viewers: HashMap<AccountId, Vec<AccountId>>,
}

#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct FlexiTime {
    // don't decrement minutes per epoch as users could game system by sending minutes to a friend, then logging more time. then sending hour back. 
    logged_this_epoch: i32,
    epoch: u64,
    total_tokens: i32
}

#[near_bindgen]
impl FlexiTracker {
    
    #[init]
    pub fn new() -> Self {
        Self {
            flexi_time_per_epoch: 360,
            users_tokens: HashMap::new(),
            users_authorized_viewers: HashMap::new(),
        }
    }

    pub fn claim_flexi_time(&mut self, minutes: i32) {
        require!(minutes > 0, "The amount should be a positive number");

        let user_tokens = self.users_tokens.entry(env::signer_account_id()).or_default();

        require!(minutes <= user_tokens.total_tokens, "You can not claim more minutes than you have.");

        user_tokens.total_tokens -= minutes;
    }

    pub fn transfer_time(&mut self, minutes: i32, receiver_id:AccountId){

        let sender_id = env::signer_account_id();

        require!(sender_id != receiver_id, "Sender and receiver should be different");
        require!(minutes > 0, "The amount should be a positive number");

        let sender_balance = self.users_tokens.get(&env::signer_account_id()).unwrap();
        let receiver_balance = self.users_tokens.get(&receiver_id).unwrap();
        
        require!(sender_balance.total_tokens >= minutes, "You do not have enough tokens.");
        require!(receiver_balance.total_tokens.checked_add(minutes).is_some(), "The receiver does not have enough tokens.");
        
        // sender_balance.total_tokens -= minutes;

        // self.users_tokens.insert(sender_id, sender_balance);
    }

    pub fn log_flexi_time(&mut self, minutes: i32) {
        require!(minutes > 0, "The amount should be a positive number");

        let user_tokens = self.users_tokens.entry(env::signer_account_id()).or_default();
        
        require!(user_tokens.total_tokens.checked_add(minutes).is_some(), "you've exceeded the max value, flexi-time is completed, well done.");

        let mut new_time = FlexiTime{
            logged_this_epoch: user_tokens.logged_this_epoch + minutes,
            epoch: env::epoch_height(),
            total_tokens: user_tokens.total_tokens + minutes
        };

        if user_tokens.epoch == env::epoch_height() {
            require!(self.flexi_time_per_epoch - user_tokens.logged_this_epoch - minutes > 0 , "You can't log more than {} minutes per epoch");

            self.users_tokens.insert(env::signer_account_id(), new_time);
        }
        else if env::epoch_height() > user_tokens.epoch {
            new_time.logged_this_epoch = minutes;
            self.users_tokens.insert(env::signer_account_id(), new_time);
        }
    }

    pub fn get_flexi_time(&self, account_id: AccountId) -> i32 {
        match self.users_tokens.get(&account_id) {
            Some(total_tokens) => return total_tokens.total_tokens,
            None => return 0
        }
    }
    
    pub fn get_remaining_loggable_time_in_epoch(&self, account_id: AccountId) -> i32 {
        // get users tokens
        match self.users_tokens.get(&account_id) {
            Some(user_tokens) => {
                // if we're still in current epoch, return remaining minutes user can log in this epoch
                if user_tokens.epoch == env::epoch_height() {
                    return self.flexi_time_per_epoch - user_tokens.logged_this_epoch;
                }

                return self.flexi_time_per_epoch;
            },
            None => {
                // if new epoch, return flexi time per epoch
                return self.flexi_time_per_epoch;
            }
        }
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use near_sdk::{testing_env, VMContext};
    use near_sdk::test_utils::{accounts, VMContextBuilder};

    fn get_context(predecessor_account_id: AccountId) -> VMContext {
        let mut builder = VMContextBuilder::new();

        builder.current_account_id(accounts(0)).signer_account_id(predecessor_account_id.clone()).predecessor_account_id(predecessor_account_id);
        
        return builder.build();
    }

    fn get_users_tokens (contract: FlexiTracker, user: AccountId) -> i32 {
        return contract.users_tokens.get(&user).unwrap().total_tokens;
    }

    fn setup_test_env() -> FlexiTracker {
        let context = get_context(accounts(1));
        testing_env!(context);

        let contract = FlexiTracker { flexi_time_per_epoch: 12, users_tokens: HashMap::new(),users_authorized_viewers: HashMap::new() };

        return contract;
    }

    #[test]
    fn log_flexi_time() {      
        let mut contract = setup_test_env();

        contract.log_flexi_time(1);

        let total_tokens = contract.users_tokens.get(&accounts(1)).unwrap().total_tokens;

        assert_eq!(total_tokens, 1);
    }

    #[test]
    fn can_view_flexi_time(){
        let mut contract = setup_test_env();
        
        // log roberts flexi-time
        contract.log_flexi_time(3);

        // try to get roberts flexi-time as sam
        let roberts_flexi_time = contract.get_flexi_time(accounts(1));

        assert_eq!(roberts_flexi_time, 3);
    }

    #[test]
    fn viewing_total_tokens_before_log_is_0(){
        let contract = setup_test_env();

        let roberts_flexi_time = contract.get_flexi_time(accounts(1));

        assert_eq!(roberts_flexi_time, 0);
    }

    #[test]
    #[should_panic]
    fn can_not_log_more_than_time_limit(){
        let mut contract = setup_test_env();

        contract.log_flexi_time(6);
        contract.log_flexi_time(1);

        let roberts_flexi_time = contract.get_flexi_time(accounts(1));

        assert_eq!(roberts_flexi_time, 6);
        assert_eq!(contract.users_tokens.entry(accounts(1)).or_default().logged_this_epoch, 6);
    }

    #[test]
    fn can_log_after_epoch_change(){
        let mut contract = setup_test_env();

        // log time in epoch 19
        contract.log_flexi_time(6);

        assert_eq!(contract.users_tokens.entry(accounts(1)).or_default().logged_this_epoch, 6);

        // switch context to epoch 20
        let mut context2 = get_context(accounts(1));
        context2.epoch_height = 20;
        testing_env!(context2);

        // log time in epoch 20
        contract.log_flexi_time(1);

        let roberts_data = contract.users_tokens.get(&accounts(1)).unwrap();

        assert_eq!(roberts_data.total_tokens, 7);
        assert_eq!(roberts_data.logged_this_epoch, 1);
    }

    #[test]
    fn get_remaining_hours_in_epoch(){
        let contract = setup_test_env();
        let remaining_hours = contract.get_remaining_loggable_time_in_epoch(accounts(1));
        assert_eq!(remaining_hours, 12);
    }

    #[test]
    fn claim_flexi_time(){
        let mut contract = setup_test_env();

        contract.log_flexi_time(6);

        contract.claim_flexi_time(4);

        let tokens = get_users_tokens(contract, accounts(1));

        assert_eq!(tokens, 2);
    }

    #[test]
    #[should_panic]
    fn cannot_claim_more_than_remaining_time(){
        let mut contract = setup_test_env();

        contract.log_flexi_time(6);
        contract.claim_flexi_time(7);
    }

    #[test]
    #[should_panic]
    fn cannot_log_negative_time(){
        let mut contract = setup_test_env();

        contract.log_flexi_time(-1);
    }

    #[test]
    #[should_panic]
    fn cannot_claim_negative_time(){
        let mut contract = setup_test_env();

        contract.claim_flexi_time(-1);
    }

    #[test]
    fn can_transfer_time_to_another_user(){
        
    }
    
    #[test]
    fn cannot_transfer_more_time_than_have_to_another_user(){
        
    }

    #[test]
    fn cannot_transfer_negative_time_to_another_user(){
        
    }

}

// TODO: user needs to be able to transfer tokens to other users - same as claiming the time off. or burn the tokens.