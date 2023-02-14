import { createUseThemedStyles } from '@/jss/theme';
import React from 'react';
import { CSSTransition } from 'react-transition-group';

const useStyles = createUseThemedStyles((theme) => ({
	patientOrderShelf: {
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 6,
		width: '100%',
		maxWidth: 480,
		position: 'fixed',
		overflow: 'hidden',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n0,
	},
	overlay: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 5,
		cursor: 'pointer',
		position: 'fixed',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	header: {
		padding: '28px 32px',
	},
	'@global': {
		'.patient-order-shelf-enter': {
			opacity: 0.5,
			transform: 'translateX(100%)',
		},
		'.patient-order-shelf-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.patient-order-shelf-exit-active': {
			opacity: 0.5,
			transform: 'translateX(100%)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-overlay-enter': {
			opacity: 0,
		},
		'.patient-order-shelf-overlay-enter-active': {
			opacity: 1,
			transition: 'opacity 300ms',
		},
		'.patient-order-shelf-overlay-exit': {
			opacity: 1,
		},
		'.patient-order-shelf-overlay-exit-active': {
			opacity: 0,
			transition: 'opacity 300ms',
		},
	},
}));

interface MhicPatientOrderShelfProps {
	open: boolean;
	onHide(): void;
}

export const MhicPatientOrderShelf = ({ open, onHide }: MhicPatientOrderShelfProps) => {
	const classes = useStyles();

	return (
		<>
			<CSSTransition in={open} timeout={300} classNames="patient-order-shelf" mountOnEnter unmountOnExit>
				<div className={classes.patientOrderShelf}>
					<div className={classes.header}>
						<h4>Customize Views</h4>
						<p>[TODO]: Content of this shelf</p>
					</div>
				</div>
			</CSSTransition>
			<CSSTransition
				in={open}
				timeout={300}
				classNames="patient-order-shelf-overlay"
				onClick={onHide}
				mountOnEnter
				unmountOnExit
			>
				<div className={classes.overlay} />
			</CSSTransition>
		</>
	);
};
