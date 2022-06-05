import { Typography } from "@mui/material";
import {useFlexiTime} from "../hooks/FlexiTime";

export default function CurrentFlexiTime() {
	const { flexiTime, remainingHours } = useFlexiTime();

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "25%", boxShadow: "1px 1px 3px #cecece", margin: 10 }}>
			<Typography variant="h6" component="p">
				Current flexi-time: {flexiTime}
			</Typography>
			<Typography variant="h6" component="p">
				Remaining loggable hours in epoch: {remainingHours}
			</Typography>
		</div>
	);
}
