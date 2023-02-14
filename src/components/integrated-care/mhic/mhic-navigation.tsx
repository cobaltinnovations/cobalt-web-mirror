import React, { useMemo, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

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
			position: 'relative',
			alignItems: 'center',
			display: 'inline-flex',
			textDecoration: 'none',
			color: theme.colors.n500,
			...theme.fonts.bodyNormal,
			'&:after': {
				left: 10,
				right: 10,
				bottom: 0,
				height: 2,
				content: '""',
				display: 'none',
				position: 'absolute',
				backgroundColor: theme.colors.p500,
			},
			'&:hover': {
				color: theme.colors.p500,
			},
			'&:first-of-type': {
				paddingLeft: 0,
				'&:after': {
					left: 0,
				},
			},
			'&:last-of-type': {
				paddingRight: 0,
				'&:after': {
					right: 0,
				},
			},
			'&.first-link-of-section': {
				paddingLeft: 20,
				'&:after': {
					left: 20,
				},
			},
			'&.last-link-of-section': {
				paddingRight: 20,
				borderRight: `1px solid ${theme.colors.n100}`,
				'&:after': {
					right: 20,
				},
			},
			'&.active': {
				color: theme.colors.p500,
				'&:after': {
					display: 'block',
				},
			},
		},
	},
	countBubble: {
		marginLeft: 4,
		padding: '0 8px',
		borderRadius: 32,
		...theme.fonts.default,
		color: theme.colors.p500,
		...theme.fonts.headingBold,
		backgroundColor: theme.colors.p50,
	},
}));

export const MhicNavigation = () => {
	const classes = useStyles();
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	const statusParam = useMemo(() => searchParams.get('patientOrderPanelTypeId'), [searchParams]);

	const linkSections = useRef([
		{
			links: [
				{
					id: 'NEED_ASSESSMENT',
					title: 'Need Assessment',
					count: 4,
				},
			],
		},
		{
			links: [
				{
					id: 'SAFETY_PLANNING',
					title: 'Safety Planning',
					count: 2,
				},
				{
					id: 'SPECIALTY_CARE',
					title: 'Specialty Care',
					count: 4,
				},
				{
					id: 'BHP',
					title: 'Behavioral Health Provider',
					count: 0,
				},
			],
		},
		{
			links: [
				{
					id: 'CLOSED',
					title: 'Closed',
					count: 0,
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
									to={buildQueryParamUrl(pathname, { patientOrderPanelTypeId: link.id })}
									className={classNames({
										'first-link-of-section': isFirstLink && !isFirstSection,
										'last-link-of-section': isLastLink && !isLastSection,
										active: statusParam === link.id,
									})}
								>
									<span>{link.title}</span>
									{link.count > 0 && <span className={classes.countBubble}>{link.count}</span>}
								</Link>
							);
						})}
					</React.Fragment>
				);
			})}
		</nav>
	);
};
