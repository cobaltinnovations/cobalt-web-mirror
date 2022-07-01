import { createUseThemedStyles } from '@/jss/theme';
import React, { FC } from 'react';

const useStyles = createUseThemedStyles((theme) => ({
	sessionAttendees: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
	},
	progressBar: {
		width: 80,
		height: 13,
		borderRadius: 7,
		marginBottom: 4,
		overflow: 'hidden',
		backgroundColor: theme.colors.n300,
	},
	progressBarFill: ({ percentage }: { percentage: number }) => ({
		height: '100%',
		width: `${percentage * 100}%`,
		backgroundColor: theme.colors.s500,
	}),
}));

interface SessionAttendeesProps {
	currentAmount: number;
	maxAmount?: number;
}

const SessionAttendees: FC<SessionAttendeesProps> = ({ currentAmount, maxAmount = 25 }) => {
	const classes = useStyles({
		percentage: currentAmount / maxAmount,
	});

	return (
		<div className={classes.sessionAttendees}>
			<div className={classes.progressBar}>
				<div className={classes.progressBarFill} />
			</div>
			<span className="d-block text-muted fs-default">
				{currentAmount}/{maxAmount}
			</span>
		</div>
	);
};

export default SessionAttendees;
