import { useEffect, useState } from "react";
import FlexiTrack from "../contracts/flexi_track";
import useContract from "./useContract";

export default function useFlexiTime() {
	const [flexiTime, setFlexiTime] = useState(0);
	const [remainingHours, setRemainingHours] = useState(0);

	const contract = useContract(FlexiTrack);

	const get_flexi_time = async () =>
		setFlexiTime(
			// @ts-ignore
			await contract?.get_flexi_time({
				account_id: "sam4.testnet",
			})
		);

	const get_remaining_loggable_hours_in_epoch = async () =>
		setRemainingHours(
			// @ts-ignore
			await contract?.get_remaining_loggable_hours_in_epoch({
				account_id: "sam4.testnet",
			})
		);

	const set_flexi_time = async (val: number) => {
		// @ts-ignore
		await contract?.log_flexi_time({
			args: {
				hours: val,
			},
		});
		get_flexi_time();
		get_remaining_loggable_hours_in_epoch();
	};

	const claim_flexi_time = async (val: number) => {
		// @ts-ignore
		await contract?.claim_flexi_time({
			args: {
				hours: val,
			},
		});
		get_flexi_time();
		get_remaining_loggable_hours_in_epoch();
	};

	useEffect(() => {
		get_flexi_time();
		get_remaining_loggable_hours_in_epoch();
	}, [contract]);

	return {
		flexiTime: flexiTime,
		remainingHours: remainingHours,
		setFlexiTime: set_flexi_time,
		claimFlexiTime: claim_flexi_time,
	};
}
