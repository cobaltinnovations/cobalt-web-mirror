import { MhicHeader } from '@/components/integrated-care/mhic';
import SentryRoutes from '@/components/sentry-routes';
import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import React, { useEffect } from 'react';
import { Navigate, Outlet, Route, useNavigate } from 'react-router-dom';

import MhicPanel from './mhic/panel';
import IntegratedCarePatientLandingPage from './patient/patient-landing';
import PatientDemographicsIntroduction from './patient/demographics-introduction';
import PatientDemographicsPart1 from './patient/demographics-part-1';
import PatientDemographicsPart2 from './patient/demographics-part-2';
import PatientDemographicsPart3 from './patient/demographics-part-3';
import PatientDemographicsThanks from './patient/demographics-thanks';
// import IntegratedCareScreeningPage from './patient/ic-screening';
// import IntegratedCarePatientInfoPage from './patient/patient-info';
import NoMatch from '../no-match';

const IntegratedCareLandingPage = () => {
	return (
		<SentryRoutes>
			<Route element={<Outlet />}>
				<Route index element={<IntegratedCareRedirectToRole />} />

				<Route
					path="mhic"
					element={
						<>
							<MhicHeader />
							<Outlet />
						</>
					}
				>
					<Route index element={<Navigate to="panel" replace />} />
					<Route path="panel" element={<MhicPanel />} />
				</Route>

				<Route path="patient" element={<Outlet />}>
					<Route index element={<Navigate to="landing" replace />} />
					<Route path="landing" element={<IntegratedCarePatientLandingPage />} />
					<Route path="demographics-introduction" element={<PatientDemographicsIntroduction />} />
					<Route path="demographics-part-1" element={<PatientDemographicsPart1 />} />
					<Route path="demographics-part-2" element={<PatientDemographicsPart2 />} />
					<Route path="demographics-part-3" element={<PatientDemographicsPart3 />} />
					<Route path="demographics-thanks" element={<PatientDemographicsThanks />} />
					{/* <Route path="info" element={<IntegratedCarePatientInfoPage />} />
					<Route path="screening" element={<IntegratedCareScreeningPage />} /> */}
					<Route path="*" element={<NoMatch />} />
				</Route>
			</Route>
		</SentryRoutes>
	);
};

export default IntegratedCareLandingPage;

const IntegratedCareRedirectToRole = () => {
	const { account } = useAccount();
	const navigate = useNavigate();

	useEffect(() => {
		if (!account) {
			throw new Error('IC Route mounted before fetching account');
		}

		navigate(LoginDestinationIdRouteMap[account.loginDestinationId], {
			replace: true,
		});
	}, [account, navigate]);

	return null;
};
