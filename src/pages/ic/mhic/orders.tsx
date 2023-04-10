import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import FileInputButton from '@/components/file-input-button';
import {
	MhicAssignOrderModal,
	MhicGenerateOrdersModal,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicPatientOrderTableColumnConfig,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import config from '@/lib/config';
import { integratedCareService } from '@/lib/services';

import useFetchPanelAccounts from '../hooks/use-fetch-panel-accounts';
import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import { PatientOrderDispositionId, PatientOrderStatusId } from '@/lib/models';

enum PatientOrderViewId {
	ASSIGNED = 'ASSIGNED',
	CLOSED = 'CLOSED',
	PENDING = 'PENDING',
}

const MhicOrders = () => {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const patientOrderStatusId = searchParams.get('patientOrderStatusId');
	const patientOrderDispositionId = searchParams.get('patientOrderDispositionId');

	const { fetchPanelAccounts, panelAccounts = [] } = useFetchPanelAccounts();
	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();

	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);

	const [selectAll, setSelectAll] = useState(false);
	const [selectedPatientOrderIds, setSelectedPatientOrderIds] = useState<string[]>([]);
	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);

	const patientOrderViewId = useMemo(() => {
		if (patientOrderStatusId) {
			if (patientOrderStatusId === PatientOrderStatusId.PENDING) {
				return PatientOrderViewId.PENDING;
			} else {
				return PatientOrderViewId.ASSIGNED;
			}
		} else if (patientOrderDispositionId === PatientOrderDispositionId.CLOSED) {
			return PatientOrderViewId.CLOSED;
		} else {
			return null;
		}
	}, [patientOrderDispositionId, patientOrderStatusId]);

	const pageTitleMap = useMemo(
		() => ({
			[PatientOrderViewId.ASSIGNED]: 'Assigned Orders',
			[PatientOrderViewId.CLOSED]: 'Closed Orders',
			[PatientOrderViewId.PENDING]: 'Pending Orders',
		}),
		[]
	);

	const patientOrderTableConfig: Record<PatientOrderViewId, MhicPatientOrderTableColumnConfig> = useMemo(
		() => ({
			[PatientOrderViewId.ASSIGNED]: {
				checkbox: true,
				flag: true,
				patient: true,
				referralDate: true,
				practice: true,
				referralReason: true,
				assessmentStatus: true,
				outreachNumber: true,
				lastOutreach: true,
			},
			[PatientOrderViewId.CLOSED]: {
				patient: true,
				referralDate: true,
				practice: true,
				closureDate: true,
				reasoneForClosure: true,
				episode: true,
			},
			[PatientOrderViewId.PENDING]: {
				checkbox: true,
				flag: true,
				patient: true,
				referralDate: true,
				practice: true,
				referralReason: true,
				outreachNumber: true,
				episode: true,
			},
		}),
		[]
	);

	const fetchTableData = useCallback(() => {
		return fetchPatientOrders({
			...(patientOrderStatusId && { patientOrderStatusId }),
			...(patientOrderDispositionId && { patientOrderDispositionId }),
			...(pageNumber && { pageNumber }),
			pageSize: '15',
		});
	}, [fetchPatientOrders, pageNumber, patientOrderDispositionId, patientOrderStatusId]);

	const handleImportPatientsInputChange = useCallback(
		(file: File) => {
			const fileReader = new FileReader();

			fileReader.addEventListener('load', async () => {
				const fileContent = fileReader.result;

				try {
					if (typeof fileContent !== 'string') {
						throw new Error('Could not read file.');
					}

					await integratedCareService.importPatientOrders({ csvContent: fileContent }).fetch();
					await fetchTableData();

					addFlag({
						variant: 'success',
						title: 'Your patients were imported!',
						description: 'These patients are now available to view.',
						actions: [],
					});
				} catch (error) {
					handleError(error);
				}
			});

			fileReader.readAsText(file);
		},
		[addFlag, handleError, fetchTableData]
	);

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
			<MhicGenerateOrdersModal
				show={showGenerateOrdersModal}
				onHide={() => {
					setShowGenerateOrdersModal(false);
				}}
				onSave={() => {
					addFlag({
						variant: 'success',
						title: 'Your patient orders were generated!',
						description: 'You can now import these patient orders.',
						actions: [],
					});
					setShowGenerateOrdersModal(false);
				}}
			/>

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
				<Row className="mb-8">
					<Col>
						<MhicPageHeader
							title={patientOrderViewId ? pageTitleMap[patientOrderViewId] : 'Patient Orders'}
							description={`${totalCountDescription} ${totalCount === 1 ? 'Order' : 'Orders'}`}
						>
							<div className="d-flex align-items-center">
								{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
									<Button
										className="me-4"
										variant="outline-primary"
										onClick={() => {
											setShowGenerateOrdersModal(true);
										}}
									>
										Generate
									</Button>
								)}
								<FileInputButton
									className="me-4 d-inline-flex"
									accept=".csv"
									onChange={handleImportPatientsInputChange}
								>
									Import
								</FileInputButton>
								<Button
									onClick={() => {
										fetchPanelAccounts();
										setShowAssignOrderModal(true);
									}}
									disabled={selectedPatientOrderIds.length <= 0}
								>
									Assign Orders{' '}
									{selectedPatientOrderIds.length > 0 && <>({selectedPatientOrderIds.length})</>}
								</Button>
							</div>
						</MhicPageHeader>
					</Col>
				</Row>
				<Row>
					<Col>
						{patientOrderViewId && (
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
								columnConfig={patientOrderTableConfig[patientOrderViewId]}
							/>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default MhicOrders;
