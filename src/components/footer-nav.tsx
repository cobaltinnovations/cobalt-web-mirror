import React from 'react';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import mediaQueries from '@/jss/media-queries';

const useStyles = createUseStyles({
	links: {
		textAlign: 'left',
		[mediaQueries.md]: {
			textAlign: 'center',
		},
	},
});

const FooterNav = () => {
	const classes = useStyles();

	const links = [
		{
			label: 'Home',
			to: '/',
		},
		{
			label: 'Group Sessions',
			to: '/group-sessions',
		},
		{
			label: 'Resource Library',
			to: '/resource-library',
		},
		{
			label: 'Contact Us',
			to: '/feedback',
		},
		{
			label: 'Privacy',
			to: '/privacy',
		},
	];

	return (
		<>
			{links.map((link) => (
				<Link
					key={link.label}
					className={classNames('d-block fw-normal text-decoration-none mb-3', classes.links)}
					to={link.to}
				>
					{link.label}
				</Link>
			))}
		</>
	);
};

export default FooterNav;
