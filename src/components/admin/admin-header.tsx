import React, { useMemo } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import config from '@/lib/config';

export const ADMIN_HEADER_HEIGHT = 56;

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: ADMIN_HEADER_HEIGHT,
		display: 'flex',
		position: 'fixed',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	brandingOuter: {
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		padding: '8px 16px 8px 40px',
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	navigationOuter: {
		flex: 1,
		height: '100%',
		display: 'flex',
		paddingLeft: 22,
		paddingRight: 40,
		alignItems: 'center',
		justifyContent: 'space-between',
		'& nav ul': {
			margin: 0,
			padding: 0,
			height: '100%',
			display: 'flex',
			listStyle: 'none',
		},
		'& nav ul li': {
			height: '100%',
			position: 'relative',
			'& a': {
				height: '100%',
				display: 'flex',
				padding: '0 12px',
				alignItems: 'center',
				textDecoration: 'none',
				...theme.fonts.default,
				color: theme.colors.n500,
				...theme.fonts.bodyNormal,
				'&:hover': {
					color: theme.colors.p700,
					backgroundColor: 'transparent',
				},
			},
			'&:after': {
				left: 12,
				right: 12,
				bottom: 0,
				height: 2,
				content: '""',
				display: 'block',
				position: 'absolute',
				backgroundColor: 'transparent',
			},
			'&:first-child': {
				'& a': {
					paddingLeft: 0,
				},
				'&:after': {
					left: 0,
				},
			},
			'&:last-child': {
				'& a': {
					paddingRight: 0,
				},
				'&:after': {
					right: 0,
				},
			},
			'&.active': {
				'& a': {
					color: theme.colors.p700,
				},
				'&:after': {
					backgroundColor: theme.colors.p500,
				},
			},
		},
	},
}));

interface AdminHeaderProps {
	isGroupSessionPreview?: boolean;
}

export const AdminHeader = ({ isGroupSessionPreview }: AdminHeaderProps) => {
	const classes = useStyles();
	const { signOutAndClearContext } = useAccount();

	const contentMatch = useMatch({
		path: '/admin/content/*',
	});
	const groupSessionsMatch = useMatch({
		path: '/admin/group-sessions/*',
	});
	const schedulingMatch = useMatch({
		path: '/admin/scheduling/*',
	});
	const analyticsMatch = useMatch({
		path: '/admin/analytics/*',
	});
	const debugMatch = useMatch({
		path: '/admin/debug/*',
	});

	const navigationLinks = useMemo(
		() => [
			{
				testId: '',
				navigationItemId: 'CONTENT',
				to: '/admin/content',
				title: 'Content',
				active: !!contentMatch,
			},
			{
				testId: '',
				navigationItemId: 'GROUP_SESSIONS',
				to: '/admin/group-sessions',
				title: 'Group Sessions',
				active: !!groupSessionsMatch,
			},
			{
				testId: '',
				navigationItemId: 'SCHEDULING',
				to: '/admin/scheduling',
				title: 'Scheduling',
				active: !!schedulingMatch,
			},
			{
				testId: '',
				navigationItemId: 'ANALYTICS',
				to: '/admin/analytics',
				title: 'Analytics',
				active: !!analyticsMatch,
			},
			...(config.COBALT_WEB_SHOW_DEBUG === 'true'
				? [
						{
							testId: '',
							navigationItemId: 'DEBUG',
							to: '/admin/debug',
							title: 'Debug',
							active: !!debugMatch,
						},
				  ]
				: []),
		],
		[analyticsMatch, contentMatch, debugMatch, groupSessionsMatch, schedulingMatch]
	);

	return (
		<header className={classes.header}>
			<div className={classes.brandingOuter}>
				<LogoSmallText className="me-3 text-primary text-uppercase" width={105.78} height={14} />
				<span className="d-block text-gray">Admin</span>
			</div>
			<div className={classes.navigationOuter}>
				{isGroupSessionPreview ? (
					<p className="mb-0 text-muted">Preview Group Session</p>
				) : (
					<>
						<nav className="h-100">
							<ul>
								{navigationLinks.map((link, index) => (
									<li key={index} className={classNames({ active: link.active })}>
										{link.to && <Link to={link.to}>{link.title}</Link>}
									</li>
								))}
							</ul>
						</nav>
						<div className="d-flex align-items-center">
							<Dropdown className="d-flex align-items-center">
								<Dropdown.Toggle
									as={DropdownToggle}
									className="p-0 border-0"
									id="admin-header__dropdown-menu"
								>
									<AvatarIcon className="d-flex" />
								</Dropdown.Toggle>
								<Dropdown.Menu
									as={DropdownMenu}
									align="end"
									flip={false}
									popperConfig={{ strategy: 'fixed' }}
									renderOnMount
								>
									<Dropdown.Item
										onClick={() => {
											signOutAndClearContext();
										}}
									>
										<span className="text-danger">Sign Out</span>
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</>
				)}
			</div>
		</header>
	);
};
