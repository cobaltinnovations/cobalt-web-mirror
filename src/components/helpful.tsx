import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import { Button } from 'react-bootstrap';

import { ReactComponent as ThumpUpIcon } from '@/assets/icons/thumb-up.svg';
import { ReactComponent as ThumpDownIcon } from '@/assets/icons/thumb-down.svg';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	helpful: {
		padding: 32,
		borderRadius: 4,
		backgroundColor: theme.colors.n75,
		border: `1px solid ${theme.colors.border}`,
	},
	helpfulInner: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			flexDirection: 'column',
		},
	},
	buttonsOuter: {
		marginLeft: 16,
		display: 'd-flex',
		alignItems: 'center',
		[mediaQueries.lg]: {
			marginTop: 16,
			marginLeft: 0,
		},
	},
}));

export interface HelpfulProps {
	title: string;
	className?: string;
}

const Helpful = ({ title, className }: HelpfulProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.helpful, className)}>
			<div className={classes.helpfulInner}>
				<h4 className="mb-0 text-center">{title}</h4>
				<div className={classes.buttonsOuter}>
					<Button variant="primary" className="me-1 p-3">
						<ThumpUpIcon />
					</Button>
					<Button variant="danger" className="ms-1 p-3">
						<ThumpDownIcon />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Helpful;
