import React, { useMemo } from 'react';
import { Link, matchPath, Outlet, useLocation } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';
import { IconName } from '@awesome.me/kit-c75e843088/icons';
import classNames from 'classnames';
import { Helmet } from '@/components/helmet';
import useAccount from '@/hooks/use-account';

const useStyles = createUseThemedStyles((theme) => ({
	sideNav: {
		'& ul': {
			margin: 0,
			padding: 0,
			listStyle: 'none',
			'& li a': {
				display: 'flex',
				borderRadius: 4,
				alignItems: 'center',
				textDecoration: 'none',
				...theme.fonts.default,
				...theme.fonts.bodyNormal,
				color: theme.colors.n900,
				padding: '14px 16px 14px 8px',
				'&.active': {
					backgroundColor: theme.colors.n75,
				},
			},
		},
	},
}));

export async function loader() {
	return null;
}

export const Component = () => {
	const { institution } = useAccount();
	const classes = useStyles();
	const { pathname } = useLocation();
	const routes: { path: string; icon: IconName; title: string; active: boolean }[] = useMemo(
		() => [
			{
				path: '/account-settings/account',
				icon: 'user',
				title: 'Account',
				active: !!matchPath('/account-settings/account', pathname),
			},
			{
				path: '/account-settings/communication-preferences',
				icon: 'envelope',
				title: 'Communication Preferences',
				active: !!matchPath('/account-settings/communication-preferences', pathname),
			},
		],
		[pathname]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Account Settings</title>
			</Helmet>

			<Container className="py-16">
				<Row>
					<Col md={12} lg={4} xl={{ span: 3, offset: 1 }} className="mb-4 mb-lg-0">
						<h5 className="mb-4">Account Settings</h5>
						<hr className="mb-4" />
						<nav className={classes.sideNav}>
							<ul>
								{routes.map((route) => (
									<li key={route.path}>
										<Link to={route.path} className={classNames({ active: route.active })}>
											<SvgIcon className="me-2" kit="far" icon={route.icon} size={16} />
											{route.title}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</Col>
					<Col md={12} lg={8} xl={7}>
						<Outlet />
					</Col>
				</Row>
			</Container>
		</>
	);
};
