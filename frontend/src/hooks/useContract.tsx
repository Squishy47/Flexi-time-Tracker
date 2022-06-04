import { Contract } from "near-api-js";
import React, { useEffect } from "react";
import { ContractDetails } from "../contracts/flexi_track";
import useWallet from "./useWallet";

export default function useContract(contractDetails: ContractDetails): Contract | null {
	const wallet = useWallet();

	const [contract, setContract] = React.useState<Contract | null>(null);

	useEffect(() => {
		if (!wallet) {
			return;
		}

		setContract(
			new Contract(wallet?.account(), contractDetails.account, {
				viewMethods: contractDetails.viewMethods,
				changeMethods: contractDetails.changeMethods,
			})
		);
	}, [wallet]);

	return contract;
}
