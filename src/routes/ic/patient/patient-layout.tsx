import { PatientHeader } from '@/components/integrated-care/patient';
import Loader from '@/components/loader';
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export const IntegratedCarePatientLayout = () => {
	return (
		<>
			<PatientHeader />

			<Suspense fallback={<Loader />}>
				<Outlet />
			</Suspense>
		</>
	);
};
