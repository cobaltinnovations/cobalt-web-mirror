import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	customRowButton: {
		zIndex: 0,
		display: 'flex',
		borderRadius: 16,
		overflow: 'hidden',
		padding: '16px 8px',
		position: 'relative',
		border: `1px solid ${theme.colors.border}`,
		'& .overlay': {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
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
	column: {
		flex: 1,
		margin: '0 8px',
	},
	image: {
		height: 72,
		width: '100%',
		display: 'flex',
		borderRadius: 4,
		marginBottom: 16,
		alignItems: 'center',
		justifyContent: 'space-around',
		backgroundColor: theme.colors.n75,
	},
	header: {
		height: 16,
		width: '100%',
		marginBottom: 8,
		borderRadius: 500,
		backgroundColor: theme.colors.n100,
	},
	paragraph: {
		height: 8,
		width: '100%',
		marginBottom: 8,
		borderRadius: 500,
		backgroundColor: theme.colors.n100,
		'&:last-of-type': {
			width: '60%',
			marginBottom: 0,
		},
	},
}));

interface CustomRowButtonProps {
	title: string;
	className?: string;
	preview?: 'split-two' | 'two-columns' | 'three-columns' | 'empty';
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const useEnhancedStyles = createUseThemedStyles((theme) => ({
	previewRow: {
		display: 'flex',
		gap: 16,
		width: '100%',
	},
	previewColumn: {
		flex: 1,
		minWidth: 0,
	},
	previewText: {
		flex: 1,
		minWidth: 0,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	emptyState: {
		width: '100%',
		minHeight: 132,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		...theme.fonts.default,
		...theme.fonts.headingBold,
	},
}));

export const CustomRowButton = ({ title, className, preview = 'split-two', onClick }: CustomRowButtonProps) => {
	const classes = useStyles();
	const enhancedClasses = useEnhancedStyles();

	const renderImageBlock = (key: string) => (
		<div className={classes.image} key={`${key}-image`}>
			<SvgIcon kit="far" icon="image" size={40} className="text-gray" />
		</div>
	);

	const renderTextBlock = (key: string) => (
		<div className={enhancedClasses.previewText} key={`${key}-text`}>
			<div className={classes.header} />
			<div className={classes.paragraph} />
			<div className={classes.paragraph} />
		</div>
	);

	const renderStackedColumn = (key: string) => (
		<div className={classes.column} key={key}>
			{renderImageBlock(key)}
			<div className={classes.header} />
			<div className={classes.paragraph} />
			<div className={classes.paragraph} />
		</div>
	);

	return (
		<div className={classNames(classes.customRowButton, className)}>
			<div className="overlay">
				<Button onClick={onClick}>{title}</Button>
			</div>
			{preview === 'empty' ? (
				<div className={enhancedClasses.emptyState}>Empty Row</div>
			) : preview === 'split-two' ? (
				<div className={enhancedClasses.previewRow}>
					<div className={enhancedClasses.previewColumn}>{renderImageBlock('left')}</div>
					<div className={enhancedClasses.previewColumn}>{renderTextBlock('right')}</div>
				</div>
			) : preview === 'two-columns' ? (
				<div className={enhancedClasses.previewRow}>
					{renderStackedColumn('left')}
					{renderStackedColumn('right')}
				</div>
			) : (
				<div className={enhancedClasses.previewRow}>
					{renderStackedColumn('left')}
					{renderStackedColumn('middle')}
					{renderStackedColumn('right')}
				</div>
			)}
		</div>
	);
};
