import React from 'react';
import InputHelperSearch from '@/components/input-helper-search';
import { createUseThemedStyles } from '@/jss/theme';

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
				<AvatarIcon className="ms-6" />
			</div>
		</header>
	);
};
