import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import colors from '@/jss/colors';

const useStyles = createUseStyles({
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
		backgroundColor: colors.gray300,
	},
	progressBarFill: ({ percentage }: { percentage: number }) => ({
		height: '100%',
		width: `${percentage * 100}%`,
		backgroundColor: colors.success,
	}),
});

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
			<span className="d-block text-muted font-size-xs">
				{currentAmount}/{maxAmount}
			</span>
		</div>
	);
};

export default SessionAttendees;
