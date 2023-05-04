import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useOutletContext, useSearchParams } from 'react-router-dom';

import FileInputButton from '@/components/file-input-button';
import {
	MhicAssignOrderModal,
	MhicGenerateOrdersModal,
	MhicPageHeader,
	MhicPatientOrderTable,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import config from '@/lib/config';
import { integratedCareService } from '@/lib/services';

import useFetchPanelAccounts from '../hooks/use-fetch-panel-accounts';
import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import {
	PatientOrderAssignmentStatusId,
	PatientOrderOutreachStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';
import TabBar from '@/components/tab-bar';

import { ReactComponent as UploadIcon } from '@/assets/icons/icon-upload.svg';
// import { MhicLayoutContext } from './mhic-layout';

const uiTabToApiQueryMap = {
	NO_OUTREACH: {
		patientOrderOutreachStatusId: PatientOrderOutreachStatusId.NO_OUTREACH,
	},

	WAITING_FOR_CONSENT: {
		// TODO: WAITING_FOR_CONSENT query
	},

	NEED_ASSESSMENT: {
		patientOrderTriageStatusId: PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
	},

	SAFETY_PLANNING: {
		patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
	},

	BHP: {
		patientOrderTriageStatusId: PatientOrderTriageStatusId.BHP,
	},

	SPECIALTY_CARE: {
		patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
	},
};

const MhicOrdersUnassigned = () => {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const filterBy = (searchParams.get('filterBy') ?? 'NO_OUTREACH') as keyof typeof uiTabToApiQueryMap;
	// const { setMainViewRefresher } = useOutletContext<MhicLayoutContext>();

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

	const fetchTableData = useCallback(() => {
		return fetchPatientOrders({
			pageSize: '15',
			patientOrderAssignmentStatusId: PatientOrderAssignmentStatusId.UNASSIGNED,
			...uiTabToApiQueryMap[filterBy],
			...(pageNumber && { pageNumber }),
		});
	}, [fetchPatientOrders, filterBy, pageNumber]);

	const handleImportButtonChange = useCallback(
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

	// useEffect(() => {
	// 	setMainViewRefresher(() => fetchTableData);
	// }, [fetchTableData, setMainViewRefresher]);

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
							className="mb-6"
							title="Unassigned"
							description={`${totalCountDescription ?? 0} Order${totalCount === 1 ? '' : 's'}`}
						>
							<div className="d-flex align-items-center">
								{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
									<Button
										className="me-2"
										variant="outline-primary"
										onClick={() => {
											setShowGenerateOrdersModal(true);
										}}
									>
										Generate
									</Button>
								)}
								<FileInputButton className="me-2" accept=".csv" onChange={handleImportButtonChange}>
									<Button as="div" variant="outline-primary" className="d-flex align-items-center">
										<UploadIcon className="me-2" />
										Import
									</Button>
								</FileInputButton>
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
						</MhicPageHeader>
						<hr />
						<TabBar
							value={filterBy}
							tabs={[
								{
									title: 'No Outreach (New)',
									value: 'NO_OUTREACH',
								},
								{
									title: 'Waiting for Consent',
									value: 'WAITING_FOR_CONSENT',
								},
								{
									title: 'Need Assessment',
									value: 'NEED_ASSESSMENT',
								},
								{
									title: 'Safety Planning',
									value: 'SAFETY_PLANNING',
								},
								{
									title: 'BHP',
									value: 'BHP',
								},
								{
									title: 'Specialty Care',
									value: 'SPECIALTY_CARE',
								},
							]}
							onTabClick={(value) => {
								searchParams.set('filterBy', value);
								setSearchParams(searchParams);
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col>
						<MhicPatientOrderTable
							isLoading={isLoadingOrders}
							// TODO: WAITING_FOR_CONSENT query
							patientOrders={filterBy === 'WAITING_FOR_CONSENT' ? [] : patientOrders}
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
								outreachNumber: true,
								episode: true,
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default MhicOrdersUnassigned;
