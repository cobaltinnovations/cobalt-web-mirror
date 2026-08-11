import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface CallToActionRowButtonProps {
	title: string;
	preview: 'block' | 'full-width';
	className?: string;
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const useStyles = createUseThemedStyles((theme) => ({
	container: {
		zIndex: 0,
		display: 'flex',
		borderRadius: 16,
		overflow: 'hidden',
		position: 'relative',
		border: `1px solid ${theme.colors.border}`,
		'& .overlay': {
			inset: 0,
			zIndex: 1,
			opacity: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-around',
			position: 'absolute',
			transition: '0.3s opacity',
			backgroundColor: 'rgba(0, 0, 0, 0.6)',
		},
		'&:hover .overlay': {
			opacity: 1,
		},
	},
	previewOuter: {
		width: '100%',
		padding: 24,
		backgroundColor: theme.colors.n0,
	},
	fullWidthPreview: {
		minHeight: 176,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		borderRadius: 16,
		border: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.n0,
	},
	blockPreview: {
		minHeight: 192,
		display: 'flex',
		alignItems: 'stretch',
		borderRadius: 16,
		backgroundColor: theme.colors.p500,
	},
	blockContent: {
		flex: 1,
		padding: '32px 24px',
	},
	blockImage: {
		width: 236,
		margin: 24,
		borderRadius: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.45)',
	},
	headingLight: {
		width: 168,
		height: 18,
		margin: '0 auto 12px',
		borderRadius: 999,
		backgroundColor: theme.colors.n900,
	},
	descriptionLight: {
		width: 132,
		height: 10,
		margin: '0 auto 20px',
		borderRadius: 999,
		backgroundColor: theme.colors.n300,
	},
	buttonPrimary: {
		width: 144,
		height: 52,
		margin: '0 auto',
		borderRadius: 999,
		backgroundColor: theme.colors.p500,
	},
	blockHeading: {
		width: 132,
		height: 16,
		marginBottom: 16,
		borderRadius: 999,
		backgroundColor: theme.colors.n0,
	},
	blockDescription: {
		width: 176,
		height: 10,
		marginBottom: 24,
		borderRadius: 999,
		backgroundColor: 'rgba(255, 255, 255, 0.7)',
	},
	blockButton: {
		width: 144,
		height: 52,
		borderRadius: 999,
		backgroundColor: theme.colors.n0,
	},
}));

export const CallToActionRowButton = ({ title, preview, className, onClick }: CallToActionRowButtonProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.container, className)}>
			<div className="overlay">
				<Button onClick={onClick}>{title}</Button>
			</div>
			<div className={classes.previewOuter}>
				{preview === 'full-width' ? (
					<div className={classes.fullWidthPreview}>
						<div className={classes.headingLight} />
						<div className={classes.descriptionLight} />
						<div className={classes.buttonPrimary} />
					</div>
				) : (
					<div className={classes.blockPreview}>
						<div className={classes.blockContent}>
							<div className={classes.blockHeading} />
							<div className={classes.blockDescription} />
							<div className={classes.blockButton} />
						</div>
						<div className={classes.blockImage} />
					</div>
				)}
			</div>
		</div>
	);
};
