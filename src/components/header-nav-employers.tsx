import React from 'react';
import classNames from 'classnames';
import { Button, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';
import { useNavigationEmployers } from '@/hooks/use-navigation-employers';
import { getEmployerNavigationLinks } from '@/lib/utils/general-navigation-utils';

const useStyles = createUseThemedStyles(() => ({
	column: { width: 304, flexShrink: 0 },
	link: { whiteSpace: 'normal' },
}));

export const HeaderNavEmployers = ({
	employers,
	mobileNav,
	onNavigate,
}: {
	employers: ReturnType<typeof useNavigationEmployers>;
	mobileNav?: boolean;
	onNavigate?(title: string): void;
}) => {
	const classes = useStyles();
	return (
		<section
			aria-label="Browse by Employer"
			className={classNames('px-4 py-6', mobileNav ? 'w-100' : classes.column)}
		>
			<p className="text-n500 px-3 mb-3">Browse by Employer</p>
			{employers.status === 'loading' && (
				<p role="status" className="px-3 mb-0 text-gray">
					Loading employers…
				</p>
			)}
			{employers.status === 'error' && (
				<div className="px-3">
					<p role="status" className="mb-2 text-gray">
						Unable to load employers.
					</p>
					<Button variant="outline-primary" size="sm" onClick={employers.retry}>
						Retry
					</Button>
				</div>
			)}
			{getEmployerNavigationLinks(employers.locations).map(({ title, to }) =>
				mobileNav ? (
					<Link key={to} to={to} onClick={() => onNavigate?.(title)}>
						{title}
					</Link>
				) : (
					<Dropdown.Item
						as={Link}
						className={classes.link}
						key={to}
						to={to}
						onClick={() => onNavigate?.(title)}
					>
						{title}
					</Dropdown.Item>
				)
			)}
		</section>
	);
};
