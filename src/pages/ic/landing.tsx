import SentryRoutes from '@/components/sentry-routes';
import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import React, { useEffect } from 'react';
import { Navigate, Outlet, Route, useNavigate, useSearchParams } from 'react-router-dom';

import { MhicHeader, MhicPatientOrderShelf } from '@/components/integrated-care/mhic';
import { PatientHeader } from '@/components/integrated-care/patient';

import PatientLanding from './patient/patient-landing';
import PatientDemographicsIntroduction from './patient/demographics-introduction';
import PatientDemographicsPart1 from './patient/demographics-part-1';
import PatientDemographicsPart2 from './patient/demographics-part-2';
import PatientDemographicsPart3 from './patient/demographics-part-3';
import PatientDemographicsThanks from './patient/demographics-thanks';
import PatientAssessmentComplete from './patient/assessment-complete';
import MhicMyView from './mhic/my-view';
import MhicAssignedOrders from './mhic/assigned-orders';
import MhicOrders from './mhic/orders';
import MhicOverview from './mhic/overview';
import MhicAssessmentComplete from './mhic/assessment-complete';
import NoMatch from '../no-match';

const IntegratedCareLandingPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

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

							<MhicPatientOrderShelf
								patientOrderId={searchParams.get('openPatientOrderId')}
								onHide={() => {
									const params = new URLSearchParams(searchParams.toString());
									params.delete('openPatientOrderId');
									setSearchParams(params);
								}}
							/>
						</>
					}
				>
					<Route index element={<Navigate to="my-view" replace />} />
					<Route path="my-view" element={<MhicMyView />}>
						<Route index element={<Navigate to="overview" replace />} />
						<Route path="overview" element={<MhicOverview />} />
						<Route path="assigned-orders" element={<MhicAssignedOrders />} />
					</Route>
					<Route path="orders" element={<MhicOrders />} />
					<Route path="assessment-complete" element={<MhicAssessmentComplete />} />
					<Route path="*" element={<NoMatch />} />
				</Route>

				<Route
					path="patient"
					element={
						<>
							<PatientHeader />
							<Outlet />
						</>
					}
				>
					<Route index element={<PatientLanding />} />
					<Route path="demographics-introduction" element={<PatientDemographicsIntroduction />} />
					<Route path="demographics-part-1" element={<PatientDemographicsPart1 />} />
					<Route path="demographics-part-2" element={<PatientDemographicsPart2 />} />
					<Route path="demographics-part-3" element={<PatientDemographicsPart3 />} />
					<Route path="demographics-thanks" element={<PatientDemographicsThanks />} />
					<Route path="assessment-complete" element={<PatientAssessmentComplete />} />
					{/* <Route path="screening" element={<IntegratedCareScreeningPage />} /> */}
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
