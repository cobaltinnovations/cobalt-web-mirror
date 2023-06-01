import { createUseThemedStyles } from '@/jss/theme';
import React, { FC } from 'react';

export enum SESSION_STATUS {
	NEW = 'NEW',
	ADDED = 'ADDED',
	ARCHIVED = 'ARCHIVED',
	CANCELED = 'CANCELED',
}

interface UseStylesProps {
	status: string;
}

const useStyles = createUseThemedStyles((theme) => ({
	sessionStatusDot: {
		width: 12,
		height: 12,
		marginRight: 12,
		borderRadius: 6,
		backgroundColor: ({ status }: UseStylesProps) => {
			switch (status) {
				case SESSION_STATUS.NEW: // Now called "Pending"
					return theme.colors.n500;
				case SESSION_STATUS.ADDED:
					return theme.colors.s500;
				case SESSION_STATUS.ARCHIVED:
					return theme.colors.border;
				case SESSION_STATUS.CANCELED:
					return theme.colors.d500;
				default:
					return theme.colors.n100;
			}
		},
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
