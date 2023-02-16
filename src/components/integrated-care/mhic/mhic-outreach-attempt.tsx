import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';

const useStyles = createUseThemedStyles((theme) => ({
	outreachAttempt: {
		padding: 16,
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
}));

interface Props {
	name: string;
	date: string;
	message: string;
	onMoreClick(): void;
	className?: string;
}

export const MhicOutreachAttempt = ({ name, date, message, onMoreClick, className }: Props) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.outreachAttempt, className)}>
			<div className="d-flex align-items-center justify-content-between">
				<p className="m-0 fw-bold">
					{name}
					<span className="ms-2 fw-normal text-gray">{date}</span>
				</p>
				<Button variant="link" className="p-2" onClick={onMoreClick}>
					<MoreIcon className="d-flex" />
				</Button>
			</div>
			<p className="m-0">{message}</p>
		</div>
	);
};
