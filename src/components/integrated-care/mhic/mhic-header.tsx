import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';

import useAccount from '@/hooks/use-account';
import InputHelperSearch from '@/components/input-helper-search';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as LogoSmallText } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		display: 'flex',
		padding: '8px 40px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
}));

export const MhicHeader = () => {
	const classes = useStyles();
	const { signOutAndClearContext } = useAccount();

	return (
		<header className={classes.header}>
			<LogoSmallText className="text-primary" />
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
