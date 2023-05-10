import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import {
	MhicAssignOrderModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	MhicViewDropdown,
	parseMhicFilterQueryParamsFromURL,
	parseMhicViewDropdownQueryParamsFromURL,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';

import { PatientOrderAssignmentStatusId } from '@/lib/models';
import { MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import { AwaitedString } from '@/components/awaited-string';

interface MhicOrdersAssignedLoaderData {
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicOrdersAssignedLoaderData() {
	return useRouteLoaderData('mhic-orders-assigned') as MhicOrdersAssignedLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const pageNumber = url.searchParams.get('pageNumber') ?? 0;
	const filters = parseMhicFilterQueryParamsFromURL(url);
	const viewFilters = parseMhicViewDropdownQueryParamsFromURL(url);

	return defer({
		patientOrdersListPromise: integratedCareService
			.getPatientOrders({
				pageSize: '15',
				patientOrderAssignmentStatusId: PatientOrderAssignmentStatusId.ASSIGNED,
				...filters,
				...viewFilters,
				...(pageNumber && { pageNumber }),
			})
			.fetch()
			.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const { patientOrdersListPromise } = useMhicOrdersAssignedLoaderData();

	const [selectAll, setSelectAll] = useState(false);
	const [selectedPatientOrderIds, setSelectedPatientOrderIds] = useState<string[]>([]);
	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);

	const handleAssignOrdersSave = useCallback(
		async (patientOrderCount: number, panelAccountDisplayName: string) => {
			try {
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
		[addFlag, handleError]
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
							title="Assigned Orders"
							description={
								<AwaitedString
									resolve={patientOrdersListPromise.then((r) => {
										return `${r.totalCountDescription ?? 0} Order${r.totalCount === 1 ? '' : 's'}`;
									})}
								/>
							}
						>
							<div className="d-flex align-items-center">
								<Button
									onClick={() => {
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
							<div className="d-flex align-items-center">
								<MhicViewDropdown className="me-2" />
								<MhicFilterDropdown align="start" />
							</div>
							<div>
								<MhicSortDropdown
									className="me-2"
									align="end"
									onApply={(selectedFilters) => {
										console.log(selectedFilters);
									}}
								/>
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
								assessmentStatus: true,
								outreachNumber: true,
								lastOutreach: true,
								episode: true,
								assignedMhic: true,
							}}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
