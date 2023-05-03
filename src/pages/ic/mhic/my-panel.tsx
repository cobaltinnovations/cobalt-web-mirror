import React, { useCallback, useMemo, useState } from 'react';
import { Outlet, useMatch, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';

import { PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';
import { MhicNavigation } from '@/components/integrated-care/mhic';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as DashboardIcon } from '@/assets/icons/icon-dashboard.svg';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';
import { PatientOrderPanelCountsResponse, integratedCareService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';

const MhicMyPanel = () => {
	const [searchParams] = useSearchParams();
	const patientOrderTriageStatusId = searchParams.get('patientOrderTriageStatusId');
	const patientOrderSafetyPlanningStatusId = searchParams.get('patientOrderSafetyPlanningStatusId');

	const navigate = useNavigate();

	const [countsResponse, setCountsResponse] = useState<PatientOrderPanelCountsResponse>();

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

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getPanelCounts().fetch();
		setCountsResponse(response);
	}, []);

	const navigationItems = useMemo(
		() => [
			{
				title: 'Today',
				icon: () => <DashboardIcon width={24} height={24} className="text-p300" />,
				onClick: () => {
					navigate('/ic/mhic');
				},
				isActive: !!rootMatch,
			},
			{
				title: 'My Patients',
				icon: () => <ClipboardIcon width={24} height={24} className="text-p300" />,
				onClick: () => {
					navigate('/ic/mhic/my-patients');
				},
				isActive: !!myPatientsMatch && !patientOrderTriageStatusId && !patientOrderSafetyPlanningStatusId,
			},
			{
				title: 'My Patient Views',
				navigationItems: [
					{
						title: 'Need Assessment',
						description:
							countsResponse?.patientOrderCountsByPatientOrderTriageStatusId.NEEDS_ASSESSMENT
								.patientOrderCountDescription ?? '0',
						icon: () => <DotIcon width={24} height={24} className="text-warning" />,
						onClick: () => {
							updateSelectedOrderTriageStatusId(PatientOrderTriageStatusId.NEEDS_ASSESSMENT);
						},
						isActive:
							!!myPatientsMatch &&
							patientOrderTriageStatusId === PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
					},
					{
						title: 'Safety Planning',
						description: countsResponse?.safetyPlanningPatientOrderCountDescription,
						icon: () => <DotIcon width={24} height={24} className="text-danger" />,
						onClick: () => {
							updateSelectedOrderSafetyPlanningStatusId(
								PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING
							);
						},
						isActive:
							!!myPatientsMatch &&
							patientOrderSafetyPlanningStatusId ===
								PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
					},

					{
						title: 'BHP',
						description:
							countsResponse?.patientOrderCountsByPatientOrderTriageStatusId.BHP
								.patientOrderCountDescription ?? '0',
						icon: () => <DotIcon width={24} height={24} className="text-success" />,
						onClick: () => {
							updateSelectedOrderTriageStatusId(PatientOrderTriageStatusId.BHP);
						},
						isActive: !!myPatientsMatch && patientOrderTriageStatusId === PatientOrderTriageStatusId.BHP,
					},
					{
						title: 'Specialty Care',
						description:
							countsResponse?.patientOrderCountsByPatientOrderTriageStatusId.SPECIALTY_CARE
								.patientOrderCountDescription ?? '0',
						icon: () => <DotIcon width={24} height={24} className="text-primary" />,
						onClick: () => {
							updateSelectedOrderTriageStatusId(PatientOrderTriageStatusId.SPECIALTY_CARE);
						},
						isActive:
							!!myPatientsMatch &&
							patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE,
					},
				],
			},
		],
		[
			countsResponse?.patientOrderCountsByPatientOrderTriageStatusId.BHP.patientOrderCountDescription,
			countsResponse?.patientOrderCountsByPatientOrderTriageStatusId.NEEDS_ASSESSMENT
				.patientOrderCountDescription,
			countsResponse?.patientOrderCountsByPatientOrderTriageStatusId.SPECIALTY_CARE.patientOrderCountDescription,
			countsResponse?.safetyPlanningPatientOrderCountDescription,
			myPatientsMatch,
			navigate,
			patientOrderSafetyPlanningStatusId,
			patientOrderTriageStatusId,
			rootMatch,
			updateSelectedOrderSafetyPlanningStatusId,
			updateSelectedOrderTriageStatusId,
		]
	);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<MhicNavigation navigationItems={navigationItems}>
				<Outlet context={useOutletContext()} />
			</MhicNavigation>
		</AsyncWrapper>
	);
};

export default MhicMyPanel;
