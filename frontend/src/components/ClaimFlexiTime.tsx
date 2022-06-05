import { TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useFlexiTime } from "../hooks/FlexiTime";
import LoadingButton from "@mui/lab/LoadingButton";

export default function ClaimFlexiTime() {
	const { claimFlexiTime, loading } = useFlexiTime();
	const [tempClaimFlexiTime, setTempClaimFlexiTime] = useState("");

	useEffect(() => {
		if (tempClaimFlexiTime && !loading) {
			setTempClaimFlexiTime("");
		}
	}, [loading]);

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "25%", boxShadow: "1px 1px 3px #cecece", margin: 10 }}>
			<Typography variant="h5" component="h5">
				Claim Flexi-time
			</Typography>

			<TextField id="outlined-basic" label="Claim Flexi-time" variant="outlined" onChange={(e) => setTempClaimFlexiTime(e.target.value)} style={{ margin: 10 }} value={tempClaimFlexiTime} />
			<LoadingButton variant="contained" color="primary" onClick={() => claimFlexiTime(Number(tempClaimFlexiTime))} style={{ margin: 10, marginTop: 0 }} loading={loading && tempClaimFlexiTime.length > 0}>
				Submit
			</LoadingButton>
		</div>
	);
}
