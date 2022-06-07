import { useEffect, useState } from "react";
import useWallet from "./useWallet";
import { singletonHook } from "react-singleton-hook";

function Login() {
	const wallet = useWallet();

	const [isSignedIn, setIsSignedIn] = useState<boolean>(wallet?.isSignedIn() == undefined ? false : wallet.isSignedIn());

	useEffect(() => {
		setIsSignedIn(wallet?.isSignedIn() == undefined ? false : wallet.isSignedIn());
	}, [wallet]);

	const signIn = () =>
		wallet?.requestSignIn({
			contractId: "sam4.testnet",
			methodNames: ["claim_flexi_time", "log_flexi_time", "get_flexi_time", "get_remaining_loggable_time_in_epoch"],
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

const init = {
	isSignedIn: false,
	signIn: () => {},
	signOut: () => {},
};

export const useLogin = singletonHook(init, Login);
