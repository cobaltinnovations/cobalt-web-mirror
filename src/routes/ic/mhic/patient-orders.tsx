import React, { useCallback, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, useRevalidator, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import FileInputButton from '@/components/file-input-button';
import {
	MhicAssignOrderModal,
	MhicFilterAssignment,
	MhicFilterDropdown,
	MhicFilterFlag,
	MhicFilterFlagGetParsedQueryParams,
	MhicFilterPractice,
	MhicFilterState,
	MhicFilterStateGetParsedQueryParams,
	MhicGenerateOrdersModal,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	mhicFilterAssignmentGetParsedQueryParams,
	mhicFilterPracticeGetParsedQueryParams,
	mhicSortDropdownGetParsedQueryParams,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import config from '@/lib/config';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';

import { ReactComponent as UploadIcon } from '@/assets/icons/icon-upload.svg';
import { MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { AwaitedString } from '@/components/awaited-string';
import { useIntegratedCareLoaderData } from '../landing';
import { useMhicLayoutLoaderData } from './mhic-layout';
import useAccount from '@/hooks/use-account';

interface MhicOrdersLoaderData {
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicOrdersLoaderData() {
	return useRouteLoaderData('mhic-patient-orders') as MhicOrdersLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const pageNumber = url.searchParams.get('pageNumber') ?? 0;
	const mhicFilterStateParsedQueryParams = MhicFilterStateGetParsedQueryParams(url);
	const mhicFilterFlagParsedQueryParams = MhicFilterFlagGetParsedQueryParams(url);
	const mhicFilterPracticeParsedQueryParams = mhicFilterPracticeGetParsedQueryParams(url);
	const mhicFilterAssignmentParsedQueryParams = mhicFilterAssignmentGetParsedQueryParams(url);
	const mhicSortDropdownParsedQueryParams = mhicSortDropdownGetParsedQueryParams(url);

	return defer({
		patientOrdersListPromise: integratedCareService
			.getPatientOrders({
				pageSize: '15',
				...(pageNumber && { pageNumber }),
				...mhicFilterStateParsedQueryParams,
				...mhicFilterFlagParsedQueryParams,
				...mhicFilterPracticeParsedQueryParams,
				...mhicFilterAssignmentParsedQueryParams,
				...mhicSortDropdownParsedQueryParams,
			})
			.fetch()
			.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { account } = useAccount();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const { panelAccounts } = useMhicLayoutLoaderData();
	const { patientOrdersListPromise } = useMhicOrdersLoaderData();

	const { addFlag } = useFlags();
	const handleError = useHandleError();

	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const revalidator = useRevalidator();

	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);

	const [selectAll, setSelectAll] = useState(false);
	const [selectedPatientOrderIds, setSelectedPatientOrderIds] = useState<string[]>([]);
	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);

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

					revalidator.revalidate();

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
		[addFlag, handleError, revalidator]
	);

	const handleAssignOrdersSave = useCallback(
		async (patientOrderCount: number, panelAccountDisplayName: string) => {
			revalidator.revalidate();

			setSelectedPatientOrderIds([]);
			setShowAssignOrderModal(false);

			addFlag({
				variant: 'success',
				title: 'Patients assigned',
				description: `${patientOrderCount} Patients were assigned to ${panelAccountDisplayName}`,
				actions: [],
			});
		},
		[addFlag, revalidator]
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
							title="Patient Orders"
							description={
								<AwaitedString
									resolve={patientOrdersListPromise.then((r) => {
										return `${r.totalCountDescription ?? 0} Order${r.totalCount === 1 ? '' : 's'}`;
									})}
								/>
							}
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
								<FileInputButton
									className="me-2"
									accept=".csv"
									onChange={handleImportButtonChange}
									disabled={!account?.accountCapabilityFlags.canImportIcPatientOrders}
								>
									<Button
										as="div"
										variant={
											account?.accountCapabilityFlags.canImportIcPatientOrders
												? 'outline-primary'
												: 'dark'
										}
										className="d-flex align-items-center"
									>
										<UploadIcon className="me-2" />
										Import
									</Button>
								</FileInputButton>
								<Button
									onClick={() => {
										// fetchPanelAccounts();
										setShowAssignOrderModal(true);
									}}
									disabled={selectedPatientOrderIds.length <= 0}
								>
									Assign{' '}
									{selectedPatientOrderIds.length > 0 && <>({selectedPatientOrderIds.length})</>}
								</Button>
							</div>
						</MhicPageHeader>
						<hr className="mb-6" />
						<div className="d-flex justify-content-between align-items-center">
							<div className="d-flex align-items-center">
								<MhicFilterState className="me-2" />
								<MhicFilterFlag className="me-2" />
								<MhicFilterPractice referenceData={referenceDataResponse} className="me-2" />
								<MhicFilterAssignment panelAccounts={panelAccounts} className="me-2" />
								<MhicFilterDropdown align="start" />
							</div>
							<div>
								<MhicSortDropdown className="me-2" align="end" />
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<MhicPatientOrderTable
							patientOrderFindResultPromise={patientOrdersListPromise}
							selectAll={selectAll}
							onSelectAllChange={setSelectAll}
							selectedPatientOrderIds={selectedPatientOrderIds}
							onSelectPatientOrderIdsChange={setSelectedPatientOrderIds}
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
								insurance: true,
								outreachNumber: true,
								lastOutreach: true,
								episode: true,
							}}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
