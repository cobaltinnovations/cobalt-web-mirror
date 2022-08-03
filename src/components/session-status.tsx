import { createUseThemedStyles } from '@/jss/theme';
import React, { FC } from 'react';

export enum SESSION_STATUS {
	NEW = 'NEW',
	ADDED = 'ADDED',
	ARCHIVED = 'ARCHIVED',
	CANCELED = 'CANCELED',
}

const useStyles = createUseThemedStyles((theme) => ({
	sessionStatusDot: ({ status }: { status: SESSION_STATUS | string }) => {
		let statusColor;

		switch (status) {
			case SESSION_STATUS.NEW: // Now called "Pending"
				statusColor = theme.colors.n500;
				break;
			case SESSION_STATUS.ADDED:
				statusColor = theme.colors.s500;
				break;
			case SESSION_STATUS.ARCHIVED:
				statusColor = theme.colors.border;
				break;
			case SESSION_STATUS.CANCELED:
				statusColor = theme.colors.d500;
				break;
			default:
				statusColor = theme.colors.n100;
		}

		return {
			width: 12,
			height: 12,
			marginRight: 12,
			borderRadius: 6,
			backgroundColor: statusColor,
		};
	},
}));

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
			{status === SESSION_STATUS.NEW && <span className="fs-small">Pending</span>}
			{status === SESSION_STATUS.ADDED && <span className="fs-small">Added</span>}
			{status === SESSION_STATUS.ARCHIVED && <span className="fs-small">Archived</span>}
			{status === SESSION_STATUS.CANCELED && <span className="fs-small">Cancelled</span>}
		</div>
	);
};

export default SessionStatus;
