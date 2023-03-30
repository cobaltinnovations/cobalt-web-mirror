import React, { useCallback, useMemo } from 'react';
import { Outlet, useMatch, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';

import { PatientOrderStatusId } from '@/lib/models';
import { MhicNavigation } from '@/components/integrated-care/mhic';

import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as DashboardIcon } from '@/assets/icons/icon-dashboard.svg';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';

const MhicMyPanel = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const patientOrderStatusId = searchParams.get('patientOrderStatusId');

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
						description: '[TODO]',
						icon: () => <DotIcon width={24} height={24} className="text-warning" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.NEEDS_ASSESSMENT);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.NEEDS_ASSESSMENT,
					},
					{
						title: 'Safety Planning',
						description: '[TODO]',
						icon: () => <DotIcon width={24} height={24} className="text-danger" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.SAFETY_PLANNING);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.SAFETY_PLANNING,
					},

					{
						title: 'BHP',
						description: '[TODO]',
						icon: () => <DotIcon width={24} height={24} className="text-success" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.BHP);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.BHP,
					},
					{
						title: 'Specialty Care',
						description: '[TODO]',
						icon: () => <DotIcon width={24} height={24} className="text-primary" />,
						onClick: () => {
							updateSelectedOrderStatusId(PatientOrderStatusId.SPECIALTY_CARE);
						},
						isActive: !!myPatientsMatch && patientOrderStatusId === PatientOrderStatusId.SPECIALTY_CARE,
					},
				],
			},
		],
		[myPatientsMatch, navigate, patientOrderStatusId, rootMatch, updateSelectedOrderStatusId]
	);

	return (
		<MhicNavigation navigationItems={navigationItems}>
			<Outlet context={useOutletContext()} />
		</MhicNavigation>
	);
};

export default MhicMyPanel;
