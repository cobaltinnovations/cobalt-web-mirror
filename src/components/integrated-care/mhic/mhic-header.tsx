import React from 'react';
import { Dropdown } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';
import InputHelperSearch from '@/components/input-helper-search';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 56,
		display: 'flex',
		position: 'fixed',
		alignItems: 'center',
		padding: '8px 40px 8px 0',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	brandingOuter: {
		width: 280,
		flexShrink: 0,
		height: '100%',
		display: 'flex',
		paddingLeft: 40,
		alignItems: 'center',
		borderRight: `1px solid ${theme.colors.n100}`,
	},
}));

export const MhicHeader = () => {
	const classes = useStyles();
	const { signOutAndClearContext } = useAccount();

	return (
		<header className={classes.header}>
			<div className={classes.brandingOuter}>
				<LogoSmallText className="me-3 text-primary" width={105.78} height={14} />
				<span className="d-block text-gray">Integrated Care</span>
			</div>
			<div className="d-flex align-items-center justify-content-between">
				<InputHelperSearch
					placeholder="Search"
					onClear={() => {
						return;
					}}
				/>
				<Dropdown className="ms-6 d-flex align-items-center">
					<Dropdown.Toggle as={DropdownToggle} id="mhic-header__dropdown-menu">
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
		</header>
	);
};
