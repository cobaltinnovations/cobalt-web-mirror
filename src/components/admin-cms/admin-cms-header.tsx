import React, { FC, useContext } from 'react';

import { createUseThemedStyles } from '@/jss/theme';

import { HeaderContext } from '@/contexts/header-context';

import { ReactComponent as CobaltLogo } from '@/assets/logos/logo-icon.svg';
import { Link } from 'react-router-dom';

const useHeaderStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 2,
		height: '82px',
		display: 'flex',
		alignItems: 'center',
		backgroundColor: theme.colors.n0,
		justifyContent: 'space-between',
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	logoOuter: {
		width: 270,
		flexShrink: 0,
		height: '100%',
		display: 'flex',
		padding: '0 30px',
		alignItems: 'center',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	titleOuter: {
		flex: 1,
		height: '100%',
		display: 'flex',
		padding: '0 30px',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	link: {
		...theme.fonts.h3,
		color: theme.colors.p500,
		letterSpacing: 4,
		textDecoration: 'none',
		fontWeight: 'normal',
		'&:hover': {
			textDecoration: 'none',
		},
	},
	headerTitle: {
		margin: 0,
		...theme.fonts.h3,
		overflow: 'hidden',
		textAlign: 'center',
		color: theme.colors.n900,
		whiteSpace: 'nowrap',
		...theme.fonts.headingBold,
		textOverflow: 'ellipsis',
		maxWidth: 'calc(100% - 160px)',
	},
	avatar: {
		width: '49px',
		height: '49px',
		overflow: 'hidden',
		borderRadius: '50%',
	},
	cobaltLogo: {
		width: '19px',
		height: '18px',
		marginRight: 8,
		marginTop: -2,
		'& path': {
			fill: theme.colors.p500,
		},
	},
}));

const AdminCmsHeader: FC = () => {
	const headerContext = useContext(HeaderContext);
	const classes = useHeaderStyles();

	return (
		<div className={classes.header}>
			<div className={classes.logoOuter}>
				<Link className={classes.link} to={'/'}>
					<CobaltLogo className={classes.cobaltLogo} />
					<span>COBALT</span>
				</Link>
			</div>
			<div className={classes.titleOuter}>
				<div className={classes.headerTitle}>{headerContext.title}</div>
				<div className={classes.avatar}>
					<img alt="profile" src={'https://placebear.com/60/60'} />
				</div>
			</div>
		</div>
	);
};

export default AdminCmsHeader;
