import SentryRoutes from '@/components/sentry-routes';
import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import React, { useEffect } from 'react';
import { Navigate, Outlet, Route, useNavigate } from 'react-router-dom';

import { PatientHeader } from '@/components/integrated-care/patient';

import PatientLanding from './patient/patient-landing';
import PatientDemographicsIntroduction from './patient/demographics-introduction';
import PatientDemographicsPart1 from './patient/demographics-part-1';
import PatientDemographicsPart2 from './patient/demographics-part-2';
import PatientDemographicsPart3 from './patient/demographics-part-3';
import PatientDemographicsThanks from './patient/demographics-thanks';
import PatientAssessmentComplete from './patient/assessment-complete';
import MhicMyPanel from './mhic/my-panel';
import MhicMyPatients from './mhic/my-patients';
import MhicOverview from './mhic/overview';
import MhicOrderAssessment from './mhic/order-assessment';
import MhicOrderLayout from './mhic/order-layout';
import ScreeningQuestionsPage from '../screening/screening-questions';
import NoMatch from '../no-match';
import MhicSearchResults from './mhic/search-results';
import MhicLayout from './mhic/mhic-layout';
import MhicOrdersUnassigned from './mhic/orders-unassigned';
import MhicOrdersAssigned from './mhic/orders-assigned';
import MhicOrdersClosed from './mhic/orders-closed';
import PatientConsent from './patient/patient-consent';

const IntegratedCareLandingPage = () => {
	return (
		<SentryRoutes>
			<Route index element={<IntegratedCareRedirectToRole />} />

			<Route path="mhic" element={<MhicLayout />}>
				<Route element={<MhicMyPanel />}>
					<Route index element={<MhicOverview />} />
					<Route path="my-patients" element={<MhicMyPatients />} />
				</Route>

				<Route path="orders/search" element={<MhicSearchResults />} />
				<Route path="orders/unassigned" element={<MhicOrdersUnassigned />} />
				<Route path="orders/assigned" element={<MhicOrdersAssigned />} />
				<Route path="orders/closed" element={<MhicOrdersClosed />} />

				<Route path="orders/:patientOrderId" element={<MhicOrderLayout />}>
					<Route index element={<Navigate to="assessment" replace />} />

					<Route path="assessment" element={<MhicOrderAssessment />} />

					<Route path="assessment/:screeningQuestionContextId" element={<ScreeningQuestionsPage />} />
				</Route>

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
				<Route path="consent" element={<PatientConsent />} />
				<Route path="demographics-introduction" element={<PatientDemographicsIntroduction />} />
				<Route path="demographics-part-1" element={<PatientDemographicsPart1 />} />
				<Route path="demographics-part-2" element={<PatientDemographicsPart2 />} />
				<Route path="demographics-part-3" element={<PatientDemographicsPart3 />} />
				<Route path="demographics-thanks" element={<PatientDemographicsThanks />} />
				<Route path="assessment-complete" element={<PatientAssessmentComplete />} />
				{/* <Route path="screening" element={<IntegratedCareScreeningPage />} /> */}
				<Route path="*" element={<NoMatch />} />
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
