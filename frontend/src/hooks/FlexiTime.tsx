import { useEffect, useState } from "react";
import { singletonHook } from "react-singleton-hook";
import { useFlexiTimeContract } from "./useFlexiTimeContract";

import { utils } from "near-api-js";
import useWallet from "./useWallet";

function FlexiTime() {
	const [flexiTime, setFlexiTime] = useState(0);
	const [remainingHours, setRemainingHours] = useState(0);
	const [loading, setLoading] = useState(false);
	const wallet = useWallet();

	const contract = useFlexiTimeContract();

	const get_flexi_time = async () => {
		setLoading(true);
		console.log(wallet?.getAccountId());
		setFlexiTime(
			// @ts-ignore
			await contract?.get_flexi_time({
				account_id: wallet?.getAccountId(),
			})
		);
		setLoading(false);
	};

	const get_remaining_loggable_time_in_epoch = async () => {
		setLoading(true);

		setRemainingHours(
			// @ts-ignore
			await contract?.get_remaining_loggable_time_in_epoch({
				account_id: wallet?.getAccountId(),
			})
		);
		setLoading(false);
	};

	const set_flexi_time = async (val: number) => {
		setLoading(true);
		// @ts-ignore
		await contract?.log_flexi_time({
			args: {
				minutes: val,
			},

			amount: utils.format.parseNearAmount("0.001"), // attached deposit in yoctoNEAR (optional)
		});
		get_flexi_time();
		get_remaining_loggable_time_in_epoch();
	};

	const claim_flexi_time = async (val: number) => {
		setLoading(true);
		// @ts-ignore
		await contract?.claim_flexi_time({
			args: {
				minutes: val,
			},
		});
		get_flexi_time();
		get_remaining_loggable_time_in_epoch();
	};

	useEffect(() => {
		get_flexi_time();
		get_remaining_loggable_time_in_epoch();
	}, [contract, wallet]);

	return {
		flexiTime: flexiTime,
		remainingHours: remainingHours,
		setFlexiTime: set_flexi_time,
		claimFlexiTime: claim_flexi_time,
		loading: loading,
	};
}

export const useFlexiTime = singletonHook(
	{
		flexiTime: 0,
		remainingHours: 0,
		setFlexiTime: async (val: number) => {},
		claimFlexiTime: async (val: number) => {},
		loading: false,
	},
	FlexiTime
);
