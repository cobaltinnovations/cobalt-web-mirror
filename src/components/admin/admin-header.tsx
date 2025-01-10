import React, { useMemo } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { config } from '@/config';

import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';

export const ADMIN_HEADER_HEIGHT = 60;

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
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	brandingOuter: {
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		padding: '8px 16px 8px 40px',
		borderRight: `1px solid ${theme.colors.border}`,
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

export const AdminHeader = () => {
	const classes = useStyles();
	const { account, signOutAndClearContext } = useAccount();

	const isResourcePreview = useMatch({
		path: '/admin/resources/preview/*',
	});
	const isGroupSessionPreview = useMatch({
		path: '/admin/group-sessions/preview/*',
	});
	const resourcesMatch = useMatch({
		path: '/admin/resources/*',
	});
	const groupSessionsMatch = useMatch({
		path: '/admin/group-sessions/*',
	});
	const pagesMatch = useMatch({
		path: '/admin/pages/*',
	});
	const reportsMatch = useMatch({
		path: '/admin/reports/*',
	});
	const analyticsMatch = useMatch({
		path: '/admin/analytics/*',
	});
	const studyInsightsMatch = useMatch({
		path: '/admin/study-insights/*',
	});
	const debugMatch = useMatch({
		path: '/admin/debug/*',
	});

	const navigationLinks = useMemo(
		() => [
			...(account?.accountCapabilityFlags.canAdministerContent
				? [
						{
							testId: '',
							navigationItemId: 'RESOURCES',
							to: '/admin/resources',
							title: 'Resources',
							active: !!resourcesMatch,
						},
				  ]
				: []),
			...(account?.accountCapabilityFlags.canAdministerGroupSessions
				? [
						{
							testId: '',
							navigationItemId: 'GROUP_SESSIONS',
							to: '/admin/group-sessions',
							title: 'Group Sessions',
							active: !!groupSessionsMatch,
						},
				  ]
				: []),
			{
				testId: '',
				navigationItemId: 'PAGES',
				title: 'Pages',
				to: '/admin/pages',
				active: !!pagesMatch,
			},
			...(account?.accountCapabilityFlags.canViewProviderReports
				? [
						{
							testId: '',
							navigationItemId: 'REPORTS',
							title: 'Provider Reports',
							to: '/admin/reports',
							active: !!reportsMatch,
						},
				  ]
				: []),
			// {
			// 	testId: '',
			// 	navigationItemId: 'SCHEDULING',
			// 	to: '/admin/scheduling',
			// 	title: 'Scheduling',
			// 	active: !!schedulingMatch,
			// },
			...(account?.accountCapabilityFlags.canViewAnalytics
				? [
						{
							testId: '',
							navigationItemId: 'ANALYTICS',
							to: '/admin/analytics',
							title: 'Analytics',
							active: !!analyticsMatch,
						},
				  ]
				: []),
			...(account?.accountCapabilityFlags.canViewStudyInsights
				? [
						{
							testId: '',
							navigationItemId: 'STUDY_INSIGHTS',
							to: '/admin/study-insights',
							title: 'Study Insights',
							active: !!studyInsightsMatch,
						},
				  ]
				: []),
			...(config.showDebug
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
		[
			account?.accountCapabilityFlags.canAdministerContent,
			account?.accountCapabilityFlags.canAdministerGroupSessions,
			account?.accountCapabilityFlags.canViewAnalytics,
			account?.accountCapabilityFlags.canViewProviderReports,
			account?.accountCapabilityFlags.canViewStudyInsights,
			analyticsMatch,
			debugMatch,
			groupSessionsMatch,
			pagesMatch,
			reportsMatch,
			resourcesMatch,
			studyInsightsMatch,
		]
	);

	const showLinks = !isResourcePreview && !isGroupSessionPreview;

	return (
		<header className={classes.header}>
			<div className={classes.brandingOuter}>
				<LogoSmallText className="me-3 text-primary text-uppercase" width={105.78} height={14} />
				<span className="d-block text-gray">Admin</span>
			</div>
			<div className={classes.navigationOuter}>
				{isResourcePreview && <p className="mb-0 text-muted">Preview Resource</p>}

				{isGroupSessionPreview && <p className="mb-0 text-muted">Preview Group Session</p>}

				{showLinks && (
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
									<Dropdown.Item as={Link} to="/" target="_blank">
										<div className="d-flex justify-content-between align-items-center">
											<p className="mb-0 pe-4 fw-semibold">Cobalt Home</p>
											<ExternalIcon className="text-gray" />
										</div>
									</Dropdown.Item>

									<Dropdown.Divider />

									<Dropdown.Item
										onClick={() => {
											signOutAndClearContext(
												AnalyticsNativeEventAccountSignedOutSource.ADMIN_HEADER,
												{}
											);
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
