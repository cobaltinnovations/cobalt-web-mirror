import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';

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
	const { subdomainInstitution } = useAccount();

	const links = useRef([
		{
			title: 'Call 911',
			description: '24/7 Emergency',
			href: 'tel:911',
		},
		{
			title: 'Call 988',
			description: 'Suicide & Crisis Lifeline',
			href: 'tel:988',
		},
		{
			title: 'Text 741741',
			description: '24/7 Crisis Text Line',
			href: 'sms:741741',
		},
		...(subdomainInstitution?.institutionId === 'COBALT'
			? [
					{
						title: 'Call 215-555-9999',
						description: '24/7 Cobalt Crisis Response Center',
						href: 'tel:2155559999',
					},
			  ]
			: []),
	]).current;

	return (
		<>
			{links.map((link, index) => {
				const isLast = links.length - 1 === index;

				return (
					<Button
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
