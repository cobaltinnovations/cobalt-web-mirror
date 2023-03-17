import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import {
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicPatientOrderTable,
	MhicSortDropdown,
} from '@/components/integrated-care/mhic';

const MhicAssignedOrders = () => {
	const handleError = useHandleError();

	const [searchParams, setSearchParams] = useSearchParams();
	const patientOrderPanelTypeId = useMemo(() => searchParams.get('patientOrderPanelTypeId'), [searchParams]);
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const pageSize = useRef(15);

	const [tableIsLoading, setTableIsLoading] = useState(false);
	const [patientOrders, setPatientOrders] = useState<PatientOrderModel[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('0');

	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const fetchPatientOrders = useCallback(async () => {
		try {
			setTableIsLoading(true);

			const response = await integratedCareService
				.getPatientOrders({
					...(patientOrderPanelTypeId && { patientOrderPanelTypeId }),
					...(pageNumber && { pageNumber }),
					pageSize: String(pageSize.current),
				})
				.fetch();

			setPatientOrders(response.findResult.patientOrders);
			setTotalCount(response.findResult.totalCount);
			setTotalCountDescription(response.findResult.totalCountDescription);
		} catch (error) {
			handleError(error);
		} finally {
			setTableIsLoading(false);
		}
	}, [handleError, pageNumber, patientOrderPanelTypeId]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	useEffect(() => {
		fetchPatientOrders();
	}, [fetchPatientOrders]);

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
				isLoading={tableIsLoading}
				patientOrders={patientOrders}
				selectAll={false}
				onSelectAllChange={() => {
					return;
				}}
				selectedPatientOrderIds={[]}
				onSelectPatientOrderIdsChange={() => {
					return;
				}}
				totalPatientOrdersCount={totalCount}
				totalPatientOrdersDescription={totalCountDescription}
				pageNumber={parseInt(pageNumber, 10)}
				pageSize={pageSize.current}
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

export default MhicAssignedOrders;
