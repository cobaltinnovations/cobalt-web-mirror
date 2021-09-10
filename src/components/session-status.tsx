import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import colors from '@/jss/colors';

export enum SESSION_STATUS {
	NEW = 'NEW',
	ADDED = 'ADDED',
	ARCHIVED = 'ARCHIVED',
	CANCELED = 'CANCELED',
}

const useStyles = createUseStyles({
	sessionStatusDot: ({ status }: { status: SESSION_STATUS }) => {
		let statusColor;

		switch (status) {
			case SESSION_STATUS.NEW: // Now called "Pending"
				statusColor = colors.gray700;
				break;
			case SESSION_STATUS.ADDED:
				statusColor = colors.success;
				break;
			case SESSION_STATUS.ARCHIVED:
				statusColor = colors.border;
				break;
			case SESSION_STATUS.CANCELED:
				statusColor = colors.danger;
				break;
			default:
				statusColor = colors.gray100;
		}

		return {
			width: 12,
			height: 12,
			marginRight: 12,
			borderRadius: 6,
			backgroundColor: statusColor,
		};
	},
});

interface SessionStatusProps {
	status: SESSION_STATUS | string;
}

const SessionStatus: FC<SessionStatusProps> = ({ status }) => {
	const classes = useStyles({
		status,
	});

	return (
		<div className="d-flex align-items-center">
			<div className={classes.sessionStatusDot} />
			{status === SESSION_STATUS.NEW && <span className="font-size-xxs">Pending</span>}
			{status === SESSION_STATUS.ADDED && <span className="font-size-xxs">Added</span>}
			{status === SESSION_STATUS.ARCHIVED && <span className="font-size-xxs">Archived</span>}
			{status === SESSION_STATUS.CANCELED && <span className="font-size-xxs">Cancelled</span>}
		</div>
	);
};

export default SessionStatus;
