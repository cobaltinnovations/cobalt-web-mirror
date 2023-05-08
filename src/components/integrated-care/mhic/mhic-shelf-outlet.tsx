import { createUseThemedStyles } from '@/jss/theme';
import { useMhicPatientOrdereShelfLoaderData } from '@/routes/ic/mhic/patient-order-shelf';

import React, { createRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

const shelfRef = createRef<HTMLDivElement>();
const shelfOverlayRef = createRef<HTMLDivElement>();

const useStyles = createUseThemedStyles((theme) => ({
	patientOrderShelf: {
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 6,
		width: '95%',
		maxWidth: 800,
		display: 'flex',
		position: 'fixed',
		overflow: 'hidden',
		flexDirection: 'column',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n50,
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.n100}`,
		},
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

export const MhicShelfOutlet = () => {
	const classes = useStyles();
	const navigate = useNavigate();
	const location = useLocation();
	const shelfData = useMhicPatientOrdereShelfLoaderData();

	return (
		<>
			<CSSTransition
				nodeRef={shelfRef}
				in={!!shelfData?.patientOrderPromise}
				timeout={300}
				classNames="patient-order-shelf"
				mountOnEnter
				unmountOnExit
			>
				<div ref={shelfRef} className={classes.patientOrderShelf}>
					<Outlet />
				</div>
			</CSSTransition>
			<CSSTransition
				nodeRef={shelfOverlayRef}
				in={!!shelfData?.patientOrderPromise}
				timeout={300}
				classNames="patient-order-shelf-overlay"
				onClick={() => {
					navigate({
						pathname: '.',
						search: location.search,
					});
				}}
				mountOnEnter
				unmountOnExit
			>
				<div ref={shelfOverlayRef} className={classes.overlay} />
			</CSSTransition>
		</>
	);
};
