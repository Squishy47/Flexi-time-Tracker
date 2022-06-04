import React, { useState, useEffect } from "react";
import { connect, WalletConnection } from "near-api-js";
import { getConfig } from "../config";

export default function useWallet() {
	const [wallet, setWallet] = useState<WalletConnection | null>(null);

	useEffect(() => {
		connect(getConfig()).then((near) => setWallet(new WalletConnection(near, null)));
	}, []);

	return wallet;
}
