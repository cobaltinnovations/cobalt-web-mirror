import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries, { screenWidths } from '@/jss/media-queries';

import SvgIcon from '../svg-icon';

const headerHeight = 60;
const asideWidth = 344;
const asideWidthCollapsed = 60;

const useStyles = createUseThemedStyles((theme) => ({
	wrapper: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		position: 'fixed',
	},
	header: {
		top: 0,
		left: 0,
		right: 0,
		height: headerHeight,
		zIndex: 3,
		display: 'flex',
		padding: '0 24px',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
		[mediaQueries.lg]: {
			padding: '0 20px',
		},
	},
	exitButtonOuter: {
		flexShrink: 0,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		padding: '8px 0 8px 4px',
		borderRight: `1px solid ${theme.colors.n100}`,
		[mediaQueries.lg]: {
			border: 0,
			padding: '8px 0',
		},
	},
	exitButton: {
		display: 'flex',
		alignItems: 'center',
		textDecoration: 'none',
		color: theme.colors.n500,
		...theme.fonts.bodyNormal,
		[mediaQueries.lg]: {
			padding: '12px 12px 12px 0',
		},
	},
	headerLeft: {
		flex: 1,
		height: '100%',
		display: 'flex',
		overflow: 'hidden',
		alignItems: 'center',
	},
	aside: {
		top: headerHeight,
		left: 0,
		bottom: 0,
		zIndex: 4,
		display: 'flex',
		overflow: 'hidden',
		position: 'absolute',
		flexDirection: 'column',
		width: asideWidthCollapsed,
		backgroundColor: theme.colors.n0,
		transition: '200ms transform, 200ms width',
		borderRight: `1px solid ${theme.colors.n100}`,
		'& .aside-header': {
			borderBottom: `1px solid ${theme.colors.n100}`,
			display: 'flex',
			justifyContent: 'flex-start',
			width: asideWidth,
			padding: '0 2px 0',
			transition: '200ms padding',
			[mediaQueries.lg]: {
				justifyContent: 'flex-end',
			},
			'& .hide-menu-button': {
				display: 'flex',
				alignItems: 'center',
				textDecoration: 'none',
				padding: '16px 20px',
				'&__text': {
					opacity: 0,
					transition: '200ms opacity',
				},
				[mediaQueries.lg]: {
					display: 'none',
				},
			},
			'& .close-menu-button': {
				display: 'none',
				alignItems: 'center',
				textDecoration: 'none',
				[mediaQueries.lg]: {
					display: 'flex',
				},
			},
		},
		'& .aside-scroller': {
			flex: 1,
			opacity: 0,
			overflowY: 'auto',
			width: asideWidth,
			pointerEvents: 'none',
			padding: '0 0 12px 0',
			transition: '200ms opacity',
		},
		'&.show': {
			'& .aside-header': {
				padding: '0 0 0',
				'& .hide-menu-button': {
					padding: 16,
					'&__text': {
						opacity: 1,
					},
				},
			},
			width: asideWidth,
			'& .aside-scroller': {
				opacity: 1,
				pointerEvents: 'auto',
			},
		},
		[mediaQueries.lg]: {
			top: 0,
			maxWidth: '100%',
			width: asideWidth,
			transform: 'translateX(-100%)',
			'&.show': {
				transform: 'translateX(0%)',
			},
		},
	},
	previewPane: {
		top: headerHeight,
		left: asideWidthCollapsed,
		right: 0,
		bottom: 0,
		zIndex: 0,
		overflowY: 'auto',
		padding: '40px 24px',
		position: 'absolute',
		transition: '200ms left',
		backgroundColor: theme.colors.n50,
		'&.show': {
			left: asideWidth,
		},
		[mediaQueries.lg]: {
			left: 0,
			padding: '24px 4px',
			'&.show': {
				left: 0,
			},
		},
	},
}));

interface CourseUnitLayoutProps {
	title?: string;
	onExitButtonClick(): void;
	onNeedHelpButtonClick(): void;
	menuElement: (isMobile: boolean) => JSX.Element;
	showMenu: boolean;
	onShowMenuToggle(showMenu: boolean): void;
}

enum SIZES {
	MOBILE = 'MOBILE',
	DESKTOP = 'DESKTOP',
}

export const CourseUnitLayout = ({
	title,
	onExitButtonClick,
	onNeedHelpButtonClick,
	menuElement,
	showMenu,
	onShowMenuToggle,
	children,
}: PropsWithChildren<CourseUnitLayoutProps>) => {
	const classes = useStyles();
	const size = useRef<SIZES>();

	useEffect(() => {
		const handleWindowResize = () => {
			if (window.outerWidth <= screenWidths.lg && size.current !== SIZES.MOBILE) {
				size.current = SIZES.MOBILE;
				onShowMenuToggle(false);
			} else if (window.outerWidth > screenWidths.lg && size.current !== SIZES.DESKTOP) {
				size.current = SIZES.DESKTOP;
				onShowMenuToggle(true);
			}
		};

		handleWindowResize();
		window.addEventListener('resize', handleWindowResize);
		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [onShowMenuToggle]);

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>
				<div className={classes.headerLeft}>
					<div className={classes.exitButtonOuter}>
						<Button type="button" variant="link" className={classes.exitButton} onClick={onExitButtonClick}>
							<SvgIcon kit="far" icon="arrow-left" size={16} className="me-lg-1" />
							<span className="d-none d-lg-inline">Exit</span>
						</Button>
					</div>
					<span className="ps-lg-6 text-n700 fs-large fw-semibold text-nowrap text-truncate">{title}</span>
				</div>
				<Button
					type="button"
					variant="link"
					className="d-none d-lg-inline-flex d-flex align-items-center text-decoration-none text-nowrap"
					onClick={onNeedHelpButtonClick}
				>
					<SvgIcon kit="fas" icon="circle-question" size={20} className="flex-shrink-0 me-1" />
					Contact Us
				</Button>
			</div>
			<div
				className={classNames(classes.aside, {
					show: showMenu,
				})}
			>
				<div className="aside-header">
					<Button
						variant="link"
						className="hide-menu-button"
						onClick={() => {
							onShowMenuToggle(!showMenu);
						}}
					>
						<SvgIcon kit="fas" icon="bars" size={16} className="me-1 flex-shrink-0" />
						<span className="hide-menu-button__text">Hide Menu</span>
					</Button>
					<Button
						variant="link"
						className="close-menu-button"
						onClick={() => {
							onShowMenuToggle(false);
						}}
					>
						<SvgIcon kit="far" icon="xmark" size={16} className="me-1 flex-shrink-0" />
						Close
					</Button>
				</div>
				<div className="aside-scroller">{menuElement(size.current === SIZES.MOBILE)}</div>
			</div>
			<div
				className={classNames(classes.previewPane, {
					show: showMenu,
				})}
			>
				{children}
			</div>
		</div>
	);
};
