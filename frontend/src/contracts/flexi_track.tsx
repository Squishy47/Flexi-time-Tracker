import { ConnectedWalletAccount, Contract } from "near-api-js";

export interface ContractDetails {
	title: string;
	account: string;
	viewMethods: string[];
	changeMethods: string[];
}

const FlexiTrack: ContractDetails = {
	title: "FlexiTrack",
	account: "sam4.testnet",
	viewMethods: ["get_flexi_time", "get_remaining_loggable_hours_in_epoch"],
	changeMethods: ["claim_flexi_time", "log_flexi_time"],
};

export const FlexiTimeContract = (account: ConnectedWalletAccount) =>
	new Contract(account, FlexiTrack.account, {
		viewMethods: FlexiTrack.viewMethods,
		changeMethods: FlexiTrack.changeMethods,
	});

export default FlexiTrack;
