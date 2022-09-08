import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { CRISIS_RESOURCES } from '@/crisis-resources';

const useStyles = createUseThemedStyles(
	(theme) => ({
		linkButton: {
			padding: 24,
			width: '100%',
			display: 'flex',
			borderRadius: 8,
			alignItems: 'center',
			textDecoration: 'none',
			justifyContent: 'space-between',
			border: `1px solid ${theme.colors.n100}`,
			[mediaQueries.lg]: {
				padding: 16,
			},
		},
		iconOuter: {
			padding: 16,
			flexShrink: 0,
			borderRadius: 500,
			backgroundColor: theme.colors.p50,
			border: `2px solid ${theme.colors.p500}`,
		},
	}),
	{ index: 1 }
);

export const InCrisisTemplate = () => {
	const classes = useStyles();

	return (
		<>
			{CRISIS_RESOURCES.map((link, index) => {
				const isLast = CRISIS_RESOURCES.length - 1 === index;

				return (
					<Button
						key={index}
						variant="light"
						className={classNames(classes.linkButton, {
							'mb-4': !isLast,
						})}
						href={link.href}
					>
						<div>
							<h4 className="mb-2">{link.title}</h4>
							<p className="mb-0">{link.description}</p>
						</div>
						<div className={classes.iconOuter}>
							<PhoneIcon />
						</div>
					</Button>
				);
			})}
		</>
	);
};

export default InCrisisTemplate;
