import { useEffect, useState } from "react";
import useWallet from "./useWallet";

export default function useLogin() {
	const wallet = useWallet();

	const [isSignedIn, setIsSignedIn] = useState<boolean>(wallet?.isSignedIn() == undefined ? false : wallet.isSignedIn());

	useEffect(() => {
		setIsSignedIn(wallet?.isSignedIn() == undefined ? false : wallet.isSignedIn());
	}, [wallet]);

	const signIn = () =>
		wallet?.requestSignIn({
			contractId: "sam4.testnet",
			methodNames: ["claim_flexi_time", "log_flexi_time", "get_flexi_time", "get_remaining_hours_in_epoch"],
		});

	const signOut = () => {
		wallet?.signOut();
		setIsSignedIn(false);
	};

	return {
		isSignedIn: isSignedIn,
		signIn: signIn,
		signOut: signOut,
	};
}
