import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import { useLogin } from "../hooks/useLogin";
import Button from "@mui/material/Button";
import { Box, Toolbar } from "@mui/material";

const ResponsiveAppBar = () => {
	const { isSignedIn, signIn, signOut } = useLogin();

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{}}>
						Flexi-track
					</Typography>
					<Typography component="div" sx={{ flexGrow: 1 }}></Typography>
					{isSignedIn ? (
						<Button color="inherit" onClick={signOut}>
							disconnect wallet
						</Button>
					) : (
						<Button color="inherit" onClick={signIn}>
							connect wallet
						</Button>
					)}
				</Toolbar>
			</AppBar>
		</Box>
	);
};
export default ResponsiveAppBar;
