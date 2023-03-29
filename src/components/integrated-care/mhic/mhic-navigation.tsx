import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';

import { MHIC_HEADER_HEIGHT } from '@/components/integrated-care/mhic/mhic-header';
import { createUseThemedStyles } from '@/jss/theme';

const sideNavWidth = 280;

const useStyles = createUseThemedStyles((theme) => ({
	sideNav: {
		left: 0,
		bottom: 0,
		zIndex: 4,
		position: 'fixed',
		overflowY: 'auto',
		padding: '24px 12px',
		top: MHIC_HEADER_HEIGHT,
		width: sideNavWidth,
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	navigation: {
		'& button': {
			border: 0,
			padding: 12,
			width: '100%',
			borderRadius: 4,
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			color: theme.colors.n900,
			...theme.fonts.bodyNormal,
			backgroundColor: 'transparent',
			justifyContent: 'space-between',
			'&:hover': {
				backgroundColor: theme.colors.n50,
			},
			'&:active': {
				backgroundColor: theme.colors.n75,
			},
			'&.active': {
				backgroundColor: theme.colors.n50,
			},
			'& .chevron-icon': {
				transition: '200ms transform',
				'&--is-expanded': {
					transform: 'rotate(180deg)',
				},
			},
		},
	},
	iconOuter: {
		width: 24,
		height: 24,
		marginRight: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	body: {
		padding: `0 40px 0 ${sideNavWidth + 40}px`,
	},
}));

interface MhicNavigationItemModel {
	title: string;
	description?: string;
	icon?(): JSX.Element;
	onClick?(): void;
	navigationItems?: MhicNavigationItemModel[];
	isActive?: boolean;
}

interface MhicNavigationProps {
	navigationItems: MhicNavigationItemModel[];
}

export const MhicNavigation = ({ navigationItems, children }: PropsWithChildren<MhicNavigationProps>) => {
	const classes = useStyles();

	return (
		<>
			<div className={classes.sideNav}>
				<nav className={classes.navigation}>
					{navigationItems.map((ni, index) => (
						<MhicNavigationItem key={`${ni.title.replace(/\s+/g, '')}-${index}`} navigationItem={ni} />
					))}
				</nav>
			</div>
			<div className={classes.body}>{children}</div>
		</>
	);
};

interface MhicNavigationItemProps {
	navigationItem: MhicNavigationItemModel;
	isSubNav?: boolean;
}

const MhicNavigationItem = ({ navigationItem, isSubNav }: MhicNavigationItemProps) => {
	const classes = useStyles();

	return (
		<>
			{navigationItem.navigationItems ? (
				<>
					<hr className="my-5" />
					<h6 className="py-4 px-3 fs-small text-uppercase text-gray">{navigationItem.title}</h6>
					<div>
						{navigationItem.navigationItems.map((ni, index) => (
							<MhicNavigationItem
								isSubNav
								key={`${ni.title.replace(/\s+/g, '')}-${index}`}
								navigationItem={ni}
							/>
						))}
					</div>
				</>
			) : (
				<button onClick={navigationItem.onClick} className={classNames({ active: navigationItem.isActive })}>
					<div className="d-flex align-items-center">
						{navigationItem.icon && <div className={classes.iconOuter}>{<navigationItem.icon />}</div>}
						<span
							className={classNames('d-block', {
								'fw-semibold': !isSubNav,
								'fw-normal': isSubNav,
							})}
						>
							{navigationItem.title}
						</span>
					</div>
					{navigationItem.description && (
						<span className="d-block text-gray">{navigationItem.description}</span>
					)}
				</button>
			)}
		</>
	);
};
