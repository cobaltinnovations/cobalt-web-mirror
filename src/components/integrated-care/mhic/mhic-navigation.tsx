import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { buildQueryParamUrl } from '@/lib/utils';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';

const useStyles = createUseThemedStyles((theme) => ({
	navigation: {
		display: 'flex',
		padding: '0 64px',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
		'& a': {
			padding: '18px 10px',
			textDecoration: 'none',
			color: theme.colors.n500,
			...theme.fonts.bodyNormal,
			'&:hover': {
				color: theme.colors.p500,
			},
			'&:first-of-type': {
				paddingLeft: 0,
			},
			'&:last-of-type': {
				paddingRight: 0,
			},
			'&.first-link-of-section': {
				paddingLeft: 20,
			},
			'&.last-link-of-section': {
				paddingRight: 20,
				borderRight: `1px solid ${theme.colors.n100}`,
			},
		},
	},
}));

export const MhicNavigation = () => {
	const { pathname } = useLocation();
	const classes = useStyles();

	const linkSections = useRef([
		{
			links: [
				{
					to: buildQueryParamUrl(pathname, { status: 'NEED_ASSESSMENT' }),
					title: 'Need Assessment',
				},
			],
		},
		{
			links: [
				{
					to: buildQueryParamUrl(pathname, { status: 'SAFETY_PLANNING' }),
					title: 'Safety Planning',
				},
				{
					to: buildQueryParamUrl(pathname, { status: 'SPECIALTY_CARE' }),
					title: 'Specialty Care',
				},
				{
					to: buildQueryParamUrl(pathname, { status: 'BEHAVIORAL_HEALTH_PROVIDER' }),
					title: 'Behavioral Health Provider',
				},
			],
		},
		{
			links: [
				{
					to: buildQueryParamUrl(pathname, { status: 'CLOSED' }),
					title: 'Closed',
				},
			],
		},
	]).current;

	return (
		<nav className={classes.navigation}>
			{linkSections.map((section, sectionIndex) => {
				const isFirstSection = sectionIndex === 0;
				const isLastSection = sectionIndex === linkSections.length - 1;

				return (
					<React.Fragment key={sectionIndex}>
						{section.links.map((link, linkIndex) => {
							const isFirstLink = linkIndex === 0;
							const isLastLink = linkIndex === section.links.length - 1;

							return (
								<Link
									key={linkIndex}
									to={link.to}
									className={classNames({
										'first-link-of-section': isFirstLink && !isFirstSection,
										'last-link-of-section': isLastLink && !isLastSection,
									})}
								>
									{link.title}
								</Link>
							);
						})}
					</React.Fragment>
				);
			})}
		</nav>
	);
};
