import { Typography } from "@mui/material";
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
	const { isSignedIn } = useLogin();

	useEffect(() => {
		console.log(isSignedIn);
	}, [isSignedIn]);

	return (
		<div className="App">
			<BrowserRouter>
				<ResponsiveAppBar />
				<Routes>
					<Route
						index
						element={
							<div>
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
						}
					/>
					<Route path="about" element={<Settings />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}
