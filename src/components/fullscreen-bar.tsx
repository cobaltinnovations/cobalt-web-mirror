import React from 'react';

import SvgIcon from '@/components/svg-icon';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
		boxShadow: '0 0 1px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(26, 26, 26, 0.07)',
		position: 'sticky',
		top: 0,
		zIndex: 4,
	},
	inner: {
		alignItems: 'center',
		display: 'flex',
		gap: 24,
		minHeight: 60,
		padding: '0 40px',
		[mediaQueries.lg]: {
			gap: 16,
			padding: '0 16px',
		},
	},
	exitButton: {
		...theme.fonts.bodyMedium,
		alignItems: 'center',
		appearance: 'none',
		backgroundColor: 'transparent',
		border: 0,
		borderRight: `1px solid ${theme.colors.n100}`,
		color: theme.colors.n500,
		cursor: 'pointer',
		display: 'flex',
		flexShrink: 0,
		fontSize: 14,
		gap: 8,
		height: 60,
		lineHeight: '20px',
		margin: 0,
		padding: '0 24px 0 0',
		'&:hover': {
			color: theme.colors.n700,
		},
		'&:focus-visible': {
			outline: `2px solid ${theme.colors.p300}`,
			outlineOffset: -2,
		},
	},
	title: {
		...theme.fonts.bodyBold,
		color: theme.colors.n700,
		fontSize: 16,
		lineHeight: '24px',
	},
}));

interface FullscreenBarProps {
	title: string;
	onExit(): void;
}

const FullscreenBar = ({ title, onExit }: FullscreenBarProps) => {
	const classes = useStyles();

	return (
		<header className={classes.header}>
			<div className={classes.inner}>
				<button type="button" className={classes.exitButton} onClick={onExit}>
					<SvgIcon kit="far" icon="arrow-left-from-bracket" size={20} />
					<span>Exit</span>
				</button>
				<div className={classes.title}>{title}</div>
			</div>
		</header>
	);
};

export default FullscreenBar;
