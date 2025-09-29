import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, useRevalidator, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

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
	parseMhicFilterQueryParamsFromSearchParams,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { config } from '@/config';
import { PatientOrdersListResponse, analyticsService, integratedCareService } from '@/lib/services';

import SvgIcon from '@/components/svg-icon';
import { MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { useIntegratedCareLoaderData } from '../landing';
import { useMhicLayoutLoaderData } from './mhic-layout';
import useAccount from '@/hooks/use-account';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';
import { AnalyticsNativeEventTypeId } from '@/lib/models';
import { safeIntegerValue } from '@/lib/utils/form-utils';

interface MhicOrdersLoaderData {
	getResponseChecksum: () => Promise<string | undefined>;
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicOrdersLoaderData() {
	return useRouteLoaderData('mhic-patient-orders') as MhicOrdersLoaderData;
}

function loadPatientOrders({
	searchParams,
	isPolling = false,
}: {
	searchParams: URLSearchParams;
	isPolling?: boolean;
}) {
	const pageNumber = searchParams.get('pageNumber') ?? 0;

	const mhicFilterStateParsedQueryParams = MhicFilterStateGetParsedQueryParams(searchParams);
	const mhicFilterFlagParsedQueryParams = MhicFilterFlagGetParsedQueryParams(searchParams);
	const mhicFilterPracticeParsedQueryParams = mhicFilterPracticeGetParsedQueryParams(searchParams);
	const mhicFilterAssignmentParsedQueryParams = mhicFilterAssignmentGetParsedQueryParams(searchParams);
	const mhicSortDropdownParsedQueryParams = mhicSortDropdownGetParsedQueryParams(searchParams);
	const mhicFilterParsedQueryParams = parseMhicFilterQueryParamsFromSearchParams(searchParams);

	const request = integratedCareService.getPatientOrders({
		pageSize: '15',
		...(pageNumber && { pageNumber }),
		...mhicFilterStateParsedQueryParams,
		...mhicFilterFlagParsedQueryParams,
		...mhicFilterPracticeParsedQueryParams,
		...mhicFilterAssignmentParsedQueryParams,
		...mhicSortDropdownParsedQueryParams,
		...mhicFilterParsedQueryParams,
	});

	const patientOrdersListPromise = request.fetch({ isPolling });

	return {
		getResponseChecksum: () => patientOrdersListPromise.then(() => request.cobaltResponseChecksum),
		patientOrdersListPromise: patientOrdersListPromise.then((r) => r.findResult),
	};
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	return defer(
		loadPatientOrders({
			searchParams: url.searchParams,
		})
	);
}

export const Component = () => {
	const { account, institution } = useAccount();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const { panelAccounts } = useMhicLayoutLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const shelfData = useMhicPatientOrdereShelfLoaderData();
	const pollingFn = useCallback(() => {
		return loadPatientOrders({ searchParams, isPolling: true });
	}, [searchParams]);
	const revalidator = useRevalidator();
	const [isImporting, setIsImporting] = useState(false);
	const { data, isLoading } = usePolledLoaderData({
		useLoaderHook: useMhicOrdersLoaderData,
		enabled: !isImporting && revalidator.state !== 'loading',
		immediateUpdate: !!shelfData,
		pollingFn,
	});
	const { patientOrdersListPromise } = data;

	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [headerDescription, setHeaderDescription] = useState('');
	const pageNumber = searchParams.get('pageNumber') ?? '0';

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

					setIsImporting(true);
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
				} finally {
					setIsImporting(false);
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

	useEffect(() => {
		patientOrdersListPromise.then((r) => {
			setHeaderDescription(`${r.totalCountDescription ?? 0} Order${r.totalCount === 1 ? '' : 's'}`);
		});
	}, [patientOrdersListPromise]);

	const handleTableHasLoaded = useCallback(
		({ totalCount }: PatientOrdersListResponse['findResult']) => {
			const patientOrderSortColumnId = searchParams.get('patientOrderSortColumnId') ?? '';
			const sortDirectionId = searchParams.get('sortDirectionId') ?? '';
			const patientOrderOutreachStatusId = searchParams.get('patientOrderOutreachStatusId') ?? '';
			const patientOrderScreeningStatusId = searchParams.get('patientOrderScreeningStatusId') ?? '';
			const patientOrderScheduledScreeningScheduledDate =
				searchParams.get('patientOrderScheduledScreeningScheduledDate') ?? '';
			const patientOrderResourcingStatusId = searchParams.get('patientOrderResourcingStatusId') ?? '';
			const patientOrderResourceCheckInResponseStatusId =
				searchParams.get('patientOrderResourceCheckInResponseStatusId') ?? '';
			const patientOrderAssignmentStatusId = searchParams.get('patientOrderAssignmentStatusId') ?? '';
			const patientOrderDispositionId = searchParams.get('patientOrderDispositionId') ?? '';
			const referringPracticeIds = searchParams.getAll('referringPracticeIds') ?? [];
			const patientOrderFilterFlagTypeIds = searchParams.getAll('flag') ?? [];
			const panelAccountIds = searchParams.getAll('panelAccountId') ?? [];

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ALL_ORDERS, {
				...(patientOrderSortColumnId && { patientOrderSortColumnId }),
				...(sortDirectionId && { sortDirectionId }),
				...(patientOrderOutreachStatusId && { patientOrderOutreachStatusId }),
				...(patientOrderScreeningStatusId && { patientOrderScreeningStatusId }),
				...(patientOrderScheduledScreeningScheduledDate && {
					patientOrderScheduledScreeningScheduledDate,
				}),
				...(patientOrderResourcingStatusId && { patientOrderResourcingStatusId }),
				...(patientOrderResourceCheckInResponseStatusId && {
					patientOrderResourceCheckInResponseStatusId,
				}),
				...(patientOrderAssignmentStatusId && { patientOrderAssignmentStatusId }),
				...(patientOrderDispositionId && { patientOrderDispositionId }),
				...(referringPracticeIds.length > 0 && { referringPracticeIds }),
				...(patientOrderFilterFlagTypeIds.length > 0 && { patientOrderFilterFlagTypeIds }),
				...(panelAccountIds.length > 0 && { panelAccountIds }),
				pageSize: 15,
				pageNumber: safeIntegerValue(pageNumber),
				totalCount,
			});
		},
		[pageNumber, searchParams]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Integrated Care - Patient Orders</title>
			</Helmet>

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
							description={headerDescription || <Spinner as="span" animation="border" size="sm" />}
						>
							<div className="d-flex align-items-center">
								{config.showDebug && (
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
								{account?.accountCapabilityFlags.canImportIcPatientOrders && (
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
											<SvgIcon kit="far" icon="upload" size={16} className="me-2" />
											Import
										</Button>
									</FileInputButton>
								)}
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
							isLoading={isLoading}
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
								assignedMhic: true,
								referralDate: true,
								practice: true,
								referralReason: true,
								insurance: true,
								outreachNumber: true,
								lastContact: true,
								nextContact: true,
								nextContactType: true,
								assessmentCompleted: true,
								episodeClosed: true,
								episode: true,
							}}
							hasLoadedCallback={handleTableHasLoaded}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
