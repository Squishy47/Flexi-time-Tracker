import { Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import useFlexiTime from "../hooks/useFlexiTime";

export default function LogFlexiTime() {
	const { setFlexiTime } = useFlexiTime();
	const [tempFlexiTime, setTempFlexiTime] = useState(0);

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "25%", boxShadow: "1px 1px 3px #cecece", margin: 10 }}>
			<Typography variant="h5" component="h5">
				Log Flexi-time
			</Typography>
			<TextField id="outlined-basic" label="Log Flexi-time" variant="outlined" onChange={(e) => setTempFlexiTime(Number(e.target.value))} style={{ margin: 10 }} />
			<Button variant="contained" color="primary" onClick={() => setFlexiTime(tempFlexiTime)} style={{ margin: 10, marginTop: 0 }}>
				Submit
			</Button>
		</div>
	);
}
