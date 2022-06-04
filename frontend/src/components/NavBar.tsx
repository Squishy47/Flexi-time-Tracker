import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from "@mui/material";
import useLogin from "../hooks/useLogin";

export function NavBar() {
	const { isSignedIn, signIn, signOut } = useLogin();

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
						{/* <MenuIcon /> */}
					</IconButton>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Flexi-time Tracker
					</Typography>
					{isSignedIn ? (
						<Button onClick={signOut} color="inherit">
							Sign out
						</Button>
					) : (
						<Button onClick={signIn} color="inherit">
							Sign in
						</Button>
					)}
					{/* <Button color="inherit">Login</Button> */}
				</Toolbar>
			</AppBar>
		</Box>

		// <Container maxWidth="sm">
		// 	<div style={{ float: "right" }}>{isSignedIn ? <Button onClick={signOut}>Sign out</Button> : <Button onClick={signIn}>Sign in</Button>}</div>
		// </Container>
	);
}
