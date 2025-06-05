import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';

const useStyles = createUseThemedStyles((theme) => ({
	halfLayout: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		display: 'flex',
		position: 'fixed',
		[mediaQueries.lg]: {
			display: 'block',
			position: 'static',
		},
	},
	col: {
		flex: 1,
		flexShrink: 0,
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			position: 'static',
			padding: '56px 0',
		},
	},
	rightCol: {
		flex: 1,
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	logoOuter: {
		top: 96,
		left: '50%',
		position: 'absolute',
		transform: 'translateX(-50%)',
		[mediaQueries.lg]: {
			top: 'auto',
			left: 'auto',
			marginBottom: 32,
			position: 'relative',
			transform: 'translateX(0)',
		},
	},
	form: {
		width: '80%',
		maxWidth: 380,
		margin: '0 auto',
	},
	illustration: {
		maxWidth: '80%',
		margin: '0 auto',
		display: 'block',
	},
}));

interface HalfLayoutProps {
	leftColChildren(className: string): JSX.Element;
	rightColChildren(className: string): JSX.Element;
}

const HalfLayout = ({ leftColChildren, rightColChildren }: HalfLayoutProps) => {
	const classes = useStyles();

	return (
		<div className={classes.halfLayout}>
			<div className={classes.col}>
				<Link className={classes.logoOuter} to="/">
					<Logo />
				</Link>
				<div className="w-100">{leftColChildren(classes.form)}</div>
			</div>
			<div className={classNames(classes.col, classes.rightCol)}>
				<div className="w-100">{rightColChildren(classes.illustration)}</div>
			</div>
		</div>
	);
};

export default HalfLayout;
