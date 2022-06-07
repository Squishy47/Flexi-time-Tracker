import { Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import ResponsiveAppBar from "./components/AppBar";
import ClaimFlexiTime from "./components/ClaimFlexiTime";
import CurrentFlexiTime from "./components/CurrentFlexiTime";
import LogFlexiTime from "./components/LogFlexiTIme";

import { useLogin } from "./hooks/useLogin";
import Settings from "./pages/Settings";

export default function App() {
	const { isSignedIn, signIn } = useLogin();

	return (
		<div className="App">
			<ResponsiveAppBar />

			<div>
				{isSignedIn ? (
					<div>
						<LogFlexiTime />
						<ClaimFlexiTime />
						<CurrentFlexiTime />
					</div>
				) : (
					<Button onClick={signIn} variant="contained" style={{ margin: 20 }}>
						Connect NEAR wallet
					</Button>
				)}
			</div>
		</div>
	);
}
