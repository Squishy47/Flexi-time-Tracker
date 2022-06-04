import { TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import useFlexiTime from "../hooks/useFlexiTime";

export default function ClaimFlexiTime() {
	const { claimFlexiTime } = useFlexiTime();
	const [tempClaimFlexiTime, setTempClaimFlexiTime] = useState(0);

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "25%", boxShadow: "1px 1px 3px #cecece", margin: 10 }}>
			<Typography variant="h5" component="h5">
				Claim Flexi-time
			</Typography>

			<TextField id="outlined-basic" label="Claim Flexi-time" variant="outlined" onChange={(e) => setTempClaimFlexiTime(Number(e.target.value))} style={{ margin: 10 }} />
			<Button variant="contained" color="primary" onClick={() => claimFlexiTime(tempClaimFlexiTime)} style={{ margin: 10, marginTop: 0 }}>
				Submit
			</Button>
		</div>
	);
}
