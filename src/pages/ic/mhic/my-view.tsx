import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { matchPath, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ActivePatientOrderCountModel, PatientOrderPanelTypeId, PatientOrderStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { MhicNavigation } from '@/components/integrated-care/mhic';
import { ReactComponent as FlagSuccess } from '@/assets/icons/flag-success.svg';
import { ReactComponent as AssessmentIcon } from '@/assets/icons/icon-assessment.svg';
import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';

const MhicMyView = () => {
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	const handleError = useHandleError();
	const navigate = useNavigate();

	const [activePatientOrderCountsByPatientOrderStatusId, setActivePatientOrderCountsByPatientOrderStatusId] =
		useState<Record<PatientOrderStatusId, ActivePatientOrderCountModel>>();

	const fetchPatientOrders = useCallback(async () => {
		try {
			const response = await integratedCareService.getPatientOrders({}).fetch();
			setActivePatientOrderCountsByPatientOrderStatusId(response.activePatientOrderCountsByPatientOrderStatusId);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	useEffect(() => {
		fetchPatientOrders();
	}, [fetchPatientOrders]);

	const navigationItems = useMemo(
		() => [
			{
				title: 'Overview',
				icon: () => <FlagSuccess width={20} height={20} className="text-p300" />,
				onClick: () => {
					navigate('/ic/mhic/my-view/overview');
				},
				isActive: !!matchPath('/ic/mhic/my-view/overview', pathname),
			},
			{
				title: 'Assigned Orders',
				icon: () => <AssessmentIcon width={20} height={20} className="text-p300" />,
				navigationItems: [
					{
						title: 'All',
						description: '[TODO]',
						icon: () => <DotIcon className="text-n300" />,
						onClick: () => {
							navigate('/ic/mhic/my-view/assigned-orders');
						},
						isActive:
							!!matchPath('/ic/mhic/my-view/assigned-orders', pathname) &&
							searchParams.get('patientOrderPanelTypeId') === null,
					},
					{
						title: 'Need Assessment',
						description: '[TODO]',
						icon: () => <DotIcon className="text-warning" />,
						onClick: () => {
							navigate(
								`/ic/mhic/my-view/assigned-orders?patientOrderPanelTypeId=${PatientOrderPanelTypeId.NEED_ASSESSMENT}`
							);
						},
						isActive:
							!!matchPath('/ic/mhic/my-view/assigned-orders', pathname) &&
							searchParams.get('patientOrderPanelTypeId') === PatientOrderPanelTypeId.NEED_ASSESSMENT,
					},
					{
						title: 'Safety Planning',
						description: '[TODO]',
						icon: () => <DotIcon className="text-danger" />,
						onClick: () => {
							navigate(
								`/ic/mhic/my-view/assigned-orders?patientOrderPanelTypeId=${PatientOrderPanelTypeId.SAFETY_PLANNING}`
							);
						},
						isActive:
							!!matchPath('/ic/mhic/my-view/assigned-orders', pathname) &&
							searchParams.get('patientOrderPanelTypeId') === PatientOrderPanelTypeId.SAFETY_PLANNING,
					},
					{
						title: 'Specialty Care',
						description: '[TODO]',
						icon: () => <DotIcon className="text-primary" />,
						onClick: () => {
							navigate(
								`/ic/mhic/my-view/assigned-orders?patientOrderPanelTypeId=${PatientOrderPanelTypeId.SPECIALTY_CARE}`
							);
						},
						isActive:
							!!matchPath('/ic/mhic/my-view/assigned-orders', pathname) &&
							searchParams.get('patientOrderPanelTypeId') === PatientOrderPanelTypeId.SPECIALTY_CARE,
					},
					{
						title: 'BHP',
						description: '[TODO]',
						icon: () => <DotIcon className="text-success" />,
						onClick: () => {
							navigate(
								`/ic/mhic/my-view/assigned-orders?patientOrderPanelTypeId=${PatientOrderPanelTypeId.BHP}`
							);
						},
						isActive:
							!!matchPath('/ic/mhic/my-view/assigned-orders', pathname) &&
							searchParams.get('patientOrderPanelTypeId') === PatientOrderPanelTypeId.BHP,
					},
					{
						title: 'Closed',
						description:
							activePatientOrderCountsByPatientOrderStatusId?.[PatientOrderStatusId.CLOSED]
								.countDescription ?? '0',
						icon: () => <DotIcon className="text-gray" />,
						onClick: () => {
							navigate(
								`/ic/mhic/my-view/assigned-orders?patientOrderPanelTypeId=${PatientOrderPanelTypeId.CLOSED}`
							);
						},
						isActive:
							!!matchPath('/ic/mhic/my-view/assigned-orders', pathname) &&
							searchParams.get('patientOrderPanelTypeId') === PatientOrderPanelTypeId.CLOSED,
					},
				],
			},
		],
		[activePatientOrderCountsByPatientOrderStatusId, navigate, pathname, searchParams]
	);

	return (
		<>
			<MhicNavigation navigationItems={navigationItems}>
				<Outlet />
			</MhicNavigation>
		</>
	);
};

export default MhicMyView;
