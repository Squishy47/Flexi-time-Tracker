use near_sdk::AccountId;
use crate::borsh::maybestd::collections::HashMap;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, log,PanicOnDefault};

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct FlexiTracker {
    flexi_time_per_epoch: i8,
    users_tokens: HashMap<AccountId, FlexiTime>,
    users_authorized_viewers: HashMap<AccountId, Vec<AccountId>>,
}

#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct FlexiTime {
    // don't decrement hours per epoch as users could game system by sending hours to a friend, then logging more time. then sending hour back. 
    logged_this_epoch: i8,
    epoch: u64,
    total_tokens: i8
}

#[near_bindgen]
impl FlexiTracker {
    
    #[init]
    pub fn new() -> Self {
        Self {
            flexi_time_per_epoch: 12,
            users_tokens: HashMap::new(),
            users_authorized_viewers: HashMap::new(),
        }
    }

    pub fn claim_flexi_time(&mut self, hours: i8) {
        let user_tokens = self.users_tokens.entry(env::signer_account_id()).or_default();
        
        if hours > user_tokens.total_tokens {
            log!("You can not claim more hours than you have.");
            return;
        }
        
        user_tokens.total_tokens -= hours;
    }

    pub fn log_flexi_time(&mut self, hours: i8) {
        let user_tokens = self.users_tokens.entry(env::signer_account_id()).or_default();
        
        let mut new_time = FlexiTime{
            logged_this_epoch: user_tokens.logged_this_epoch + hours,
            epoch: env::epoch_height(),
            total_tokens: user_tokens.total_tokens + hours
        };

        if user_tokens.epoch == env::epoch_height() {
            if self.flexi_time_per_epoch - user_tokens.logged_this_epoch - hours > 0 {
                self.users_tokens.insert(env::signer_account_id(), new_time);
                return;
            }
        
            log!("You can't log more than {} hours per epoch", self.flexi_time_per_epoch);
            return;
        }

        if env::epoch_height() > user_tokens.epoch {
            new_time.logged_this_epoch = hours;
            self.users_tokens.insert(env::signer_account_id(), new_time);
            return;
        }

    }

    pub fn get_flexi_time(&self, account_id: AccountId) -> i8 {
        return self.users_tokens.get(&account_id).unwrap().total_tokens;
    }
    
    pub fn get_remaining_loggable_hours_in_epoch(&self, account_id: AccountId) -> i8 {
        // get users tokens
        let some_user_tokens = self.users_tokens.get(&account_id);

        match some_user_tokens {
            Some(user_tokens) => {
                // if we're still in current epoch, return remaining hours user can log in this epoch
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
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice.testnet".to_string(),
            signer_account_id: "robert.testnet".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "jane.testnet".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    fn get_users_tokens (mut contract: FlexiTracker, user: AccountId) -> i8 {
        return contract.users_tokens.entry(user).or_default().total_tokens;
    }

    fn setup_test_env() -> FlexiTracker {
        let context = get_context(vec![], false);
        testing_env!(context);

        let contract = FlexiTracker { flexi_time_per_epoch: 12, users_tokens: HashMap::new(),users_authorized_viewers: HashMap::new() };

        return contract;
    }

    #[test]
    fn log_flexi_time() {      
        let mut contract = setup_test_env();

        contract.log_flexi_time(1);
        
        let total_tokens = get_users_tokens(contract, String::from("robert.testnet"));

        assert_eq!(total_tokens, 1);
    }

    #[test]
    fn can_view_flexi_time(){
        let mut contract = setup_test_env();
        
        // log roberts flexi-time

        contract.log_flexi_time(3);


        // try to get roberts flexi-time as sam
        let roberts_flexi_time = contract.get_flexi_time(String::from("robert.testnet"));

        assert_eq!(roberts_flexi_time, 3);
    }

    #[test]
    fn can_not_log_more_than_time_limit(){
        let mut contract = setup_test_env();

        contract.log_flexi_time(12);
        contract.log_flexi_time(1);

        let roberts_flexi_time = contract.get_flexi_time(String::from("robert.testnet"));

        assert_eq!(roberts_flexi_time, 12);
        assert_eq!(contract.users_tokens.entry(String::from("robert.testnet")).or_default().logged_this_epoch, 12);
    }

    #[test]
    fn can_log_after_epoch_change(){
        let mut contract = setup_test_env();

        // log time in epoch 19
        contract.log_flexi_time(12);

        assert_eq!(contract.users_tokens.entry(String::from("robert.testnet")).or_default().logged_this_epoch, 12);

        // switch context to epoch 20
        let mut context2 = get_context(vec![], false);
        context2.epoch_height = 20;
        testing_env!(context2);

        // log time in epoch 20
        contract.log_flexi_time(1);

        let roberts_flexi_time = contract.get_flexi_time(String::from("robert.testnet"));

        assert_eq!(roberts_flexi_time, 13);
        assert_eq!(contract.users_tokens.entry(String::from("robert.testnet")).or_default().logged_this_epoch, 1);
    }

    #[test]
    fn get_remaining_hours_in_epoch(){
        let contract = setup_test_env();
        let remaining_hours = contract.get_remaining_loggable_hours_in_epoch(String::from("robert.testnet"));
        assert_eq!(remaining_hours, 12);
    }

    #[test]
    fn claim_flexi_time(){
        let mut contract = setup_test_env();

        contract.log_flexi_time(12);

        contract.claim_flexi_time(7);

        let tokens = get_users_tokens(contract, String::from("robert.testnet"));

        assert_eq!(tokens, 5);
    }
}


// TODO: user needs to be able to transfer tokens to other users - same as claiming the time off. or burn the tokens.


