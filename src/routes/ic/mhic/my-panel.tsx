import React, { useCallback, useEffect, useState } from 'react';
import {
	LoaderFunctionArgs,
	Outlet,
	defer,
	useMatch,
	useNavigate,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';

import { PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';
import { MhicNavigation, MhicNavigationItemModel } from '@/components/integrated-care/mhic';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as DashboardIcon } from '@/assets/icons/icon-dashboard.svg';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';
import { PatientOrderPanelCountsResponse, integratedCareService } from '@/lib/services';

interface MhicMyPanelLoaderData {
	patientOrderPanelCountsPromise: Promise<PatientOrderPanelCountsResponse>;
}

export function useMhicMyPanelLoaderData() {
	return useRouteLoaderData('mhic-my-panel') as MhicMyPanelLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	console.log('==> my-panel loader');

	const countsRequest = integratedCareService.getPanelCounts();

	const patientOrderPanelCountsPromise = countsRequest.fetch();

	return defer({
		patientOrderPanelCountsPromise,
	});
}

export const Component = () => {
	const [searchParams] = useSearchParams();
	const patientOrderTriageStatusId = searchParams.get('patientOrderTriageStatusId');
	const patientOrderSafetyPlanningStatusId = searchParams.get('patientOrderSafetyPlanningStatusId');
	const [navigationItems, setNavigationItems] = useState<MhicNavigationItemModel[]>([]);

	const navigate = useNavigate();

	const { patientOrderPanelCountsPromise } = useMhicMyPanelLoaderData();

	const rootMatch = useMatch({
		path: '/ic/mhic',
		end: true,
	});

	const myPatientsMatch = useMatch({
		path: '/ic/mhic/my-patients',
		end: true,
	});

	const updateSelectedOrderTriageStatusId = useCallback(
		(statusId?: PatientOrderTriageStatusId) => {
			const params = new URLSearchParams(searchParams);

			if (statusId) {
				params.set('patientOrderTriageStatusId', statusId);
			} else {
				params.delete('patientOrderTriageStatusId');
			}

			params.delete('patientOrderSafetyPlanningStatusId');

			navigate({
				pathname: '/ic/mhic/my-patients',
				search: params.toString(),
			});
		},
		[navigate, searchParams]
	);

	const updateSelectedOrderSafetyPlanningStatusId = useCallback(
		(statusId?: PatientOrderSafetyPlanningStatusId) => {
			const params = new URLSearchParams(searchParams);

			if (statusId) {
				params.set('patientOrderSafetyPlanningStatusId', statusId);
			} else {
				params.delete('patientOrderSafetyPlanningStatusId');
			}

			params.delete('patientOrderTriageStatusId');

			navigate({
				pathname: '/ic/mhic/my-patients',
				search: params.toString(),
			});
		},
		[navigate, searchParams]
	);

	const isTodayActive = !!rootMatch;
	const isMyPatientsActive = !!myPatientsMatch && !patientOrderTriageStatusId && !patientOrderSafetyPlanningStatusId;
	const isNeedsAssessmentActive =
		!!myPatientsMatch && patientOrderTriageStatusId === PatientOrderTriageStatusId.NEEDS_ASSESSMENT;
	const isSafetPlanningActive =
		!!myPatientsMatch &&
		patientOrderSafetyPlanningStatusId === PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING;
	const isBhpActive = !!myPatientsMatch && patientOrderTriageStatusId === PatientOrderTriageStatusId.BHP;
	const isSpecialtyCareActive =
		!!myPatientsMatch && patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE;

	useEffect(() => {
		patientOrderPanelCountsPromise.then((patientOrderPanelCountsResponse) => {
			setNavigationItems([
				{
					title: 'Today',
					icon: () => <DashboardIcon width={24} height={24} className="text-p300" />,
					onClick: () => {
						navigate('/ic/mhic');
					},
					isActive: isTodayActive,
				},
				{
					title: 'My Patients',
					icon: () => <ClipboardIcon width={24} height={24} className="text-p300" />,
					onClick: () => {
						navigate('/ic/mhic/my-patients');
					},
					isActive: isMyPatientsActive,
				},
				{
					title: 'My Patient Views',
					navigationItems: [
						{
							title: 'Need Assessment',
							description:
								patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderTriageStatusId
									.NEEDS_ASSESSMENT.patientOrderCountDescription ?? '0',
							icon: () => <DotIcon width={24} height={24} className="text-warning" />,
							onClick: () => {
								updateSelectedOrderTriageStatusId(PatientOrderTriageStatusId.NEEDS_ASSESSMENT);
							},
							isActive: isNeedsAssessmentActive,
						},
						{
							title: 'Safety Planning',
							description: patientOrderPanelCountsResponse?.safetyPlanningPatientOrderCountDescription,
							icon: () => <DotIcon width={24} height={24} className="text-danger" />,
							onClick: () => {
								updateSelectedOrderSafetyPlanningStatusId(
									PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
								);
							},
							isActive: isSafetPlanningActive,
						},

						{
							title: 'BHP',
							description:
								patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderTriageStatusId.BHP
									.patientOrderCountDescription ?? '0',
							icon: () => <DotIcon width={24} height={24} className="text-success" />,
							onClick: () => {
								updateSelectedOrderTriageStatusId(PatientOrderTriageStatusId.BHP);
							},
							isActive: isBhpActive,
						},
						{
							title: 'Specialty Care',
							description:
								patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderTriageStatusId
									.SPECIALTY_CARE.patientOrderCountDescription ?? '0',
							icon: () => <DotIcon width={24} height={24} className="text-primary" />,
							onClick: () => {
								updateSelectedOrderTriageStatusId(PatientOrderTriageStatusId.SPECIALTY_CARE);
							},
							isActive: isSpecialtyCareActive,
						},
					],
				},
			]);
		});
	}, [
		isBhpActive,
		isMyPatientsActive,
		isNeedsAssessmentActive,
		isSafetPlanningActive,
		isSpecialtyCareActive,
		isTodayActive,
		navigate,
		patientOrderPanelCountsPromise,
		updateSelectedOrderSafetyPlanningStatusId,
		updateSelectedOrderTriageStatusId,
	]);

	return (
		<MhicNavigation navigationItems={navigationItems}>
			<Outlet />
		</MhicNavigation>
	);
};
