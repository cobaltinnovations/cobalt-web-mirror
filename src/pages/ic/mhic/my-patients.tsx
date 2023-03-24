import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import {
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicPatientOrderTable,
	MhicSortDropdown,
} from '@/components/integrated-care/mhic';

import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import useAccount from '@/hooks/use-account';

const MhicMyPatients = () => {
	const { account } = useAccount();
	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();
	const [searchParams, setSearchParams] = useSearchParams();

	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const accountId = account?.accountId;
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const patientOrderStatusId = searchParams.get('patientOrderStatusId');
	const patientOrderDispositionId = searchParams.get('patientOrderDispositionId');

	useEffect(() => {
		fetchPatientOrders({
			...(accountId && { panelAccountId: accountId }),
			...(patientOrderStatusId && { patientOrderStatusId }),
			...(patientOrderDispositionId && { patientOrderDispositionId }),
			...(pageNumber && { pageNumber }),
			pageSize: '15',
		});
	}, [accountId, fetchPatientOrders, pageNumber, patientOrderDispositionId, patientOrderStatusId]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<>
			<MhicCustomizeTableModal
				show={showCustomizeTableModal}
				onHide={() => {
					setShowCustomizeTableModal(false);
				}}
				onSave={() => {
					setShowCustomizeTableModal(false);
				}}
			/>

			<div className="py-6 d-flex align-items-center justify-content-between">
				<div className="d-flex">
					<MhicFilterDropdown className="me-2" />
					<MhicSortDropdown />
				</div>
				<Button
					variant="light"
					onClick={() => {
						setShowCustomizeTableModal(true);
					}}
				>
					Customize View
				</Button>
			</div>

			<MhicPatientOrderTable
				isLoading={isLoadingOrders}
				patientOrders={patientOrders}
				selectAll={false}
				onSelectPatientOrderIdsChange={() => {
					return;
				}}
				totalPatientOrdersCount={totalCount}
				totalPatientOrdersDescription={totalCountDescription}
				pageNumber={parseInt(pageNumber, 10)}
				pageSize={15}
				onPaginationClick={handlePaginationClick}
				columnConfig={{
					flag: true,
					patient: true,
					referralDate: true,
					practice: true,
					referralReason: true,
					assessmentStatus: true,
				}}
			/>
		</>
	);
};

export default MhicMyPatients;
