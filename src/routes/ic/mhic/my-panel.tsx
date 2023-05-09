import React, { useEffect, useState } from 'react';
import { Outlet, defer, useMatch, useNavigate, useRouteLoaderData } from 'react-router-dom';

import { MhicNavigation, MhicNavigationItemModel } from '@/components/integrated-care/mhic';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as DashboardIcon } from '@/assets/icons/icon-dashboard.svg';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';
import { PatientOrderPanelCountsResponse, integratedCareService } from '@/lib/services';
import { MhicMyPatientView } from './my-patients';

interface MhicMyPanelLoaderData {
	patientOrderPanelCountsPromise: Promise<PatientOrderPanelCountsResponse>;
}

export function useMhicMyPanelLoaderData() {
	return useRouteLoaderData('mhic-my-panel') as MhicMyPanelLoaderData;
}

export async function loader() {
	const countsRequest = integratedCareService.getPanelCounts();

	const patientOrderPanelCountsPromise = countsRequest.fetch();

	return defer({
		patientOrderPanelCountsPromise,
	});
}

export const Component = () => {
	const [navigationItems, setNavigationItems] = useState<MhicNavigationItemModel[]>([]);

	const navigate = useNavigate();

	const { patientOrderPanelCountsPromise } = useMhicMyPanelLoaderData();

	const overviewMatch = useMatch({
		path: '/ic/mhic/overview/*',
	});

	const myPatientsMatch = useMatch({
		path: '/ic/mhic/my-patients/:mhicView/*',
	});

	const isTodayActive = !!overviewMatch;
	const isMyPatientsActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.All;
	const isWaitingForConsentActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.WaitingForConsent;
	const isNeedsAssessmentActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.NeedAssessment;
	const isSafetyPlanningActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.SafetyPlanning;
	const isMhpActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.MHP;
	const isSpecialtyCareActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.SpecialtyCare;
	const isClosedActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.Closed;

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
						navigate('/ic/mhic/my-patients/' + MhicMyPatientView.All);
					},
					isActive: isMyPatientsActive,
				},
				{
					title: 'My Patient Views',
					navigationItems: [
						{
							title: 'Waiting for Consent',
							description: '0',
							icon: () => <DotIcon width={24} height={24} className="text-n300" />,
							onClick: () => {
								navigate(`/ic/mhic/my-patients/${MhicMyPatientView.WaitingForConsent}`);
							},
							isActive: isWaitingForConsentActive,
						},
						{
							title: 'Need Assessment',
							description:
								patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderTriageStatusId
									.NEEDS_ASSESSMENT.patientOrderCountDescription ?? '0',
							icon: () => <DotIcon width={24} height={24} className="text-warning" />,
							onClick: () => {
								navigate('/ic/mhic/my-patients/' + MhicMyPatientView.NeedAssessment);
							},
							isActive: isNeedsAssessmentActive,
						},
						{
							title: 'Safety Planning',
							description: patientOrderPanelCountsResponse?.safetyPlanningPatientOrderCountDescription,
							icon: () => <DotIcon width={24} height={24} className="text-danger" />,
							onClick: () => {
								navigate('/ic/mhic/my-patients/' + MhicMyPatientView.SafetyPlanning);
							},
							isActive: isSafetyPlanningActive,
						},

						{
							title: 'MHP',
							description:
								patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderTriageStatusId.MHP
									.patientOrderCountDescription ?? '0',
							icon: () => <DotIcon width={24} height={24} className="text-success" />,
							onClick: () => {
								navigate('/ic/mhic/my-patients/' + MhicMyPatientView.MHP);
							},
							isActive: isMhpActive,
						},
						{
							title: 'Specialty Care',
							description:
								patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderTriageStatusId
									.SPECIALTY_CARE.patientOrderCountDescription ?? '0',
							icon: () => <DotIcon width={24} height={24} className="text-primary" />,
							onClick: () => {
								navigate('/ic/mhic/my-patients/' + MhicMyPatientView.SpecialtyCare);
							},
							isActive: isSpecialtyCareActive,
						},
						{
							title: 'Closed',
							description: '0',
							icon: () => <DotIcon width={24} height={24} className="text-gray" />,
							onClick: () => {
								navigate(`/ic/mhic/my-patients/${MhicMyPatientView.Closed}`);
							},
							isActive: isClosedActive,
						},
					],
				},
			]);
		});
	}, [
		isMhpActive,
		isMyPatientsActive,
		isNeedsAssessmentActive,
		isSafetyPlanningActive,
		isSpecialtyCareActive,
		isTodayActive,
		isWaitingForConsentActive,
		navigate,
		patientOrderPanelCountsPromise,
	]);

	return (
		<MhicNavigation navigationItems={navigationItems}>
			<Outlet />
		</MhicNavigation>
	);
};
