import { createUseThemedStyles } from '@/jss/theme';
import { useMhicPatientOrdereShelfLoaderData } from '@/routes/ic/mhic/patient-order-shelf';

import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const useStyles = createUseThemedStyles((theme) => ({
	patientOrderShelf: {
		width: '95% !important',
		maxWidth: '800px !important',
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.border}`,
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
			<Offcanvas
				className={classes.patientOrderShelf}
				show={!!shelfData?.patientOrderPromise}
				placement="end"
				onHide={() => {
					navigate({
						pathname: '.',
						search: location.search,
					});
				}}
			>
				<Outlet />
			</Offcanvas>
		</>
	);
};
