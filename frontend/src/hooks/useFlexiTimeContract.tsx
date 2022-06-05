import { Contract } from "near-api-js";
import React, { useEffect } from "react";
import { singletonHook } from "react-singleton-hook";
import useWallet from "./useWallet";

import { FlexiTimeContract as _contract } from "../contracts/flexi_track";

function FlexiTimeContract(): Contract | null {
	const wallet = useWallet();

	const [contract, setContract] = React.useState<Contract | null>(null);

	useEffect(() => {
		if (!wallet) {
			return;
		}

		setContract(_contract(wallet?.account()));
	}, [wallet]);

	return contract;
}

export const useFlexiTimeContract = singletonHook(null, FlexiTimeContract);
