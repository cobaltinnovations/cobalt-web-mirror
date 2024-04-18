import React, { useEffect, useState } from 'react';
import { Outlet, defer, useMatch, useNavigate, useRouteLoaderData } from 'react-router-dom';

import { MhicNavigation, MhicNavigationItemModel } from '@/components/integrated-care/mhic';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
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
	const isNeedsAssessmentActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.NeedAssessment;
	const isScheduledActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.Scheduled;
	const isNeedDocumentationActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.NeedDocumentation;
	const isSubclinicalActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.Subclinical;
	const isMhpActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.MHP;
	const isSpecialtyCareActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.SpecialtyCare;
	const isClosedActive = myPatientsMatch?.params.mhicView === MhicMyPatientView.Closed;

	useEffect(() => {
		const itemsWithoutCounts = [
			{
				title: 'Priorities',
				icon: () => <EventIcon width={24} height={24} className="text-p300" />,
				onClick: () => {
					navigate('/ic/mhic');
				},
				isActive: isTodayActive,
			},
			{
				title: 'Assigned Orders',
				icon: () => <ClipboardIcon width={24} height={24} className="text-p300" />,
				onClick: () => {
					navigate('/ic/mhic/my-patients/' + MhicMyPatientView.All);
				},
				isActive: isMyPatientsActive,
			},
		];

		// TODO: Perhaps better moving resolution behind <Await />
		patientOrderPanelCountsPromise
			.then((patientOrderPanelCountsResponse) => {
				setNavigationItems([
					...itemsWithoutCounts,
					{
						title: 'Order Views',
						navigationItems: [
							{
								title: 'Need Assessment',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId
										.NEED_ASSESSMENT.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-n300" />,
								onClick: () => {
									navigate('/ic/mhic/my-patients/' + MhicMyPatientView.NeedAssessment);
								},
								isActive: isNeedsAssessmentActive,
							},
							{
								title: 'Assessment Scheduled',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId
										.SCHEDULED.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-secondary" />,
								onClick: () => {
									navigate('/ic/mhic/my-patients/' + MhicMyPatientView.Scheduled);
								},
								isActive: isScheduledActive,
							},
							{
								title: 'Need Documentation',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId
										.NEED_DOCUMENTATION.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-secondary" />,
								onClick: () => {
									navigate('/ic/mhic/my-patients/' + MhicMyPatientView.NeedDocumentation);
								},
								isActive: isNeedDocumentationActive,
							},
							{
								title: 'Subclinical',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId
										.SUBCLINICAL.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-p100" />,
								onClick: () => {
									navigate('/ic/mhic/my-patients/' + MhicMyPatientView.Subclinical);
								},
								isActive: isSubclinicalActive,
							},
							{
								title: 'MHP',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId.MHP
										.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-p300" />,
								onClick: () => {
									navigate('/ic/mhic/my-patients/' + MhicMyPatientView.MHP);
								},
								isActive: isMhpActive,
							},
							{
								title: 'Specialty Care',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId
										.SPECIALTY_CARE.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-primary" />,
								onClick: () => {
									navigate('/ic/mhic/my-patients/' + MhicMyPatientView.SpecialtyCare);
								},
								isActive: isSpecialtyCareActive,
							},
							{
								title: 'Closed',
								description:
									patientOrderPanelCountsResponse?.patientOrderCountsByPatientOrderViewTypeId.CLOSED
										.patientOrderCountDescription ?? '0',
								icon: () => <DotIcon width={24} height={24} className="text-gray" />,
								onClick: () => {
									navigate(`/ic/mhic/my-patients/${MhicMyPatientView.Closed}`);
								},
								isActive: isClosedActive,
							},
						],
					},
				]);
			})
			.catch(() => {
				setNavigationItems(itemsWithoutCounts);
			});
	}, [
		isClosedActive,
		isMhpActive,
		isMyPatientsActive,
		isNeedsAssessmentActive,
		isScheduledActive,
		isNeedDocumentationActive,
		isSpecialtyCareActive,
		isSubclinicalActive,
		isTodayActive,
		navigate,
		patientOrderPanelCountsPromise,
	]);

	return (
		<MhicNavigation navigationItems={navigationItems}>
			<Outlet />
		</MhicNavigation>
	);
};
