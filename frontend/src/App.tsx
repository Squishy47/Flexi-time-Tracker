import { Typography } from "@mui/material";
import { useEffect } from "react";
import "./App.css";
import ClaimFlexiTime from "./components/ClaimFlexiTime";
import CurrentFlexiTime from "./components/CurrentFlexiTime";
import LogFlexiTime from "./components/LogFlexiTIme";
import { NavBar } from "./components/NavBar";
import { useLogin } from "./hooks/useLogin";

export default function App() {
	const { isSignedIn } = useLogin();

	useEffect(() => {
		console.log(isSignedIn);
	}, [isSignedIn]);

	return (
		<div className="App">
			<NavBar />
			{isSignedIn ? (
				<div>
					<LogFlexiTime />
					<ClaimFlexiTime />
					<CurrentFlexiTime />
				</div>
			) : (
				<Typography variant="h5" component="h5">
					<div>Login to track flexi-time</div>
				</Typography>
			)}
		</div>
	);
}
