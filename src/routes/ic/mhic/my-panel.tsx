import React, { useCallback, useMemo } from 'react';
import {
	LoaderFunctionArgs,
	Outlet,
	useMatch,
	useNavigate,
	useOutletContext,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';

import { MhicNavigation } from '@/components/integrated-care/mhic';
import { PatientOrderStatusId } from '@/lib/models';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as DashboardIcon } from '@/assets/icons/icon-dashboard.svg';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';
import { integratedCareService } from '@/lib/services';

type MhicMyPanelLoaderData = Awaited<ReturnType<typeof loader>>;

export function useMhicMyPanelLoaderData() {
	return useRouteLoaderData('mhic-my-panel') as MhicMyPanelLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	console.log('==> my-panel loader');

	const countsByIdRequest = integratedCareService.getPanelCounts();

	const countsByIdResponse = await countsByIdRequest.fetch();

	return {
		countsByIdResponse,
	};
}

export const Component = () => {
	const [searchParams] = useSearchParams();
	const patientOrderStatusId = searchParams.get('patientOrderStatusId');
	const navigate = useNavigate();

	const { countsByIdResponse } = useMhicMyPanelLoaderData();

	const countsById = countsByIdResponse.patientOrderCountsByPatientOrderStatusId;

	const rootMatch = useMatch({
		path: '/ic/mhic',
		end: true,
	});

	const myPatientsMatch = useMatch({
		path: '/ic/mhic/my-patients',
		end: true,
	});

	const updateSelectedOrderStatusId = useCallback(
		(statusId?: PatientOrderStatusId) => {
			const params = new URLSearchParams(searchParams);

			if (statusId) {
				params.set('patientOrderStatusId', statusId);
			} else {
				params.delete('patientOrderStatusId');
			}

			navigate({
				pathname: '/ic/mhic/my-patients',
				search: params.toString(),
			});
		},
		[navigate, searchParams]
	);

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
				isActive: !!myPatientsMatch && !patientOrderStatusId,
			},
			{
				title: 'My Patient Views',
				navigationItems: [
					{
						title: 'Need Assessment',
						description: countsById.NEEDS_ASSESSMENT.patientOrderCountDescription,
						icon: () => <DotIcon width={24} height={24} className="text-warning" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.NEEDS_ASSESSMENT);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.NEEDS_ASSESSMENT,
					},
					{
						title: 'Safety Planning',
						description: countsById.SAFETY_PLANNING.patientOrderCountDescription,
						icon: () => <DotIcon width={24} height={24} className="text-danger" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.SAFETY_PLANNING);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.SAFETY_PLANNING,
					},

					{
						title: 'BHP',
						description: countsById.BHP.patientOrderCountDescription,
						icon: () => <DotIcon width={24} height={24} className="text-success" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.BHP);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.BHP,
					},
					{
						title: 'Specialty Care',
						description: countsById.SPECIALTY_CARE.patientOrderCountDescription,
						icon: () => <DotIcon width={24} height={24} className="text-primary" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.SPECIALTY_CARE);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.SPECIALTY_CARE,
					},
				],
			},
		],
		[
			countsById.BHP.patientOrderCountDescription,
			countsById.NEEDS_ASSESSMENT.patientOrderCountDescription,
			countsById.SAFETY_PLANNING.patientOrderCountDescription,
			countsById.SPECIALTY_CARE.patientOrderCountDescription,
			myPatientsMatch,
			navigate,
			patientOrderStatusId,
			rootMatch,
			updateSelectedOrderStatusId,
		]
	);

	return (
		<MhicNavigation navigationItems={navigationItems}>
			<Outlet context={useOutletContext()} />
		</MhicNavigation>
	);
};
