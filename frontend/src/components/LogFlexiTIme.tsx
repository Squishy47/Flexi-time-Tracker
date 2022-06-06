import { TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useEffect, useState } from "react";
import { useFlexiTime } from "../hooks/FlexiTime";

export default function LogFlexiTime() {
	const { setFlexiTime, loading } = useFlexiTime();
	const [tempFlexiTime, setTempFlexiTime] = useState("");

	useEffect(() => {
		if (tempFlexiTime && !loading) {
			setTempFlexiTime("");
		}
	}, [loading]);

	return (
		<div style={{ display: "flex", flexDirection: "column", boxShadow: "1px 1px 3px #cecece", margin: 10 }}>
			<Typography variant="h5" component="h5">
				Log Flexi-time
			</Typography>
			<TextField id="outlined-basic" label="Log Flexi-time" variant="outlined" onChange={(e) => setTempFlexiTime(e.target.value)} style={{ margin: 10 }} value={tempFlexiTime} />
			<LoadingButton variant="contained" color="primary" onClick={() => setFlexiTime(Number(tempFlexiTime))} style={{ margin: 10, marginTop: 0 }} loading={loading && tempFlexiTime.length > 0}>
				Submit
			</LoadingButton>
		</div>
	);
}
