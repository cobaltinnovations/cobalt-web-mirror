import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import {
	MhicAssignOrderModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';

import useFetchPanelAccounts from '../hooks/use-fetch-panel-accounts';
import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import { PatientOrderStatusId } from '@/lib/models';

const MhicOrdersAssigned = () => {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const { fetchPanelAccounts, panelAccounts = [] } = useFetchPanelAccounts();
	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();

	const [selectAll, setSelectAll] = useState(false);
	const [selectedPatientOrderIds, setSelectedPatientOrderIds] = useState<string[]>([]);
	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);

	const fetchTableData = useCallback(() => {
		return fetchPatientOrders({
			pageSize: '15',
			...(pageNumber && { pageNumber }),
			patientOrderStatusId: [
				PatientOrderStatusId.NEEDS_ASSESSMENT,
				PatientOrderStatusId.SCHEDULED,
				PatientOrderStatusId.SAFETY_PLANNING,
				PatientOrderStatusId.SPECIALTY_CARE,
				PatientOrderStatusId.SUBCLINICAL,
				PatientOrderStatusId.BHP,
			],
		});
	}, [fetchPatientOrders, pageNumber]);

	const handleAssignOrdersSave = useCallback(
		async (patientOrderCount: number, panelAccountDisplayName: string) => {
			try {
				await fetchTableData();

				setSelectedPatientOrderIds([]);
				setShowAssignOrderModal(false);
				addFlag({
					variant: 'success',
					title: 'Patients assigned',
					description: `${patientOrderCount} Patients were assigned to ${panelAccountDisplayName}`,
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, fetchTableData]
	);

	const clearSelections = useCallback(() => {
		setSelectAll(false);
		setSelectedPatientOrderIds([]);
	}, []);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
			clearSelections();
		},
		[clearSelections, searchParams, setSearchParams]
	);

	useEffect(() => {
		fetchTableData();
	}, [fetchTableData]);

	return (
		<>
			<MhicAssignOrderModal
				patientOrderIds={selectedPatientOrderIds}
				panelAccounts={panelAccounts}
				show={showAssignOrderModal}
				onHide={() => {
					setShowAssignOrderModal(false);
				}}
				onSave={handleAssignOrdersSave}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader
							className="mb-6"
							title="Assigned Orders"
							description={`${totalCountDescription} Order${totalCount === 1 ? '' : 's'}`}
						>
							<div className="d-flex align-items-center">
								<Button
									onClick={() => {
										fetchPanelAccounts();
										setShowAssignOrderModal(true);
									}}
									disabled={selectedPatientOrderIds.length <= 0}
								>
									MHIC Assigned{' '}
									{selectedPatientOrderIds.length > 0 && <>({selectedPatientOrderIds.length})</>}
								</Button>
							</div>
						</MhicPageHeader>
						<hr className="mb-6" />
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<MhicFilterDropdown
									align="start"
									onApply={(selectedFilters) => {
										console.log(selectedFilters);
									}}
								/>
							</div>
							<div className="d-flex align-items-center">
								<MhicSortDropdown
									className="me-2"
									align="end"
									onApply={(selectedFilters) => {
										console.log(selectedFilters);
									}}
								/>
								<Button
									onClick={() => {
										fetchPanelAccounts();
										setShowAssignOrderModal(true);
									}}
									disabled={selectedPatientOrderIds.length <= 0}
								>
									Assign{' '}
									{selectedPatientOrderIds.length > 0 && <>({selectedPatientOrderIds.length})</>}
								</Button>
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<MhicPatientOrderTable
							isLoading={isLoadingOrders}
							patientOrders={patientOrders}
							selectAll={selectAll}
							onSelectAllChange={setSelectAll}
							selectedPatientOrderIds={selectedPatientOrderIds}
							onSelectPatientOrderIdsChange={setSelectedPatientOrderIds}
							totalPatientOrdersCount={totalCount}
							totalPatientOrdersDescription={totalCountDescription}
							pageNumber={parseInt(pageNumber, 10)}
							pageSize={15}
							onPaginationClick={handlePaginationClick}
							columnConfig={{
								checkbox: true,
								flag: true,
								patient: true,
								referralDate: true,
								practice: true,
								referralReason: true,
								assessmentStatus: true,
								outreachNumber: true,
								lastOutreach: true,
								episode: true,
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default MhicOrdersAssigned;
