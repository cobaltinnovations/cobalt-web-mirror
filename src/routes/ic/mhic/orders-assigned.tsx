import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import {
	MhicAssignOrderModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	parseMhicFilterQueryParamsFromURL,
} from '@/components/integrated-care/mhic';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';

import { PatientOrderAssignmentStatusId } from '@/lib/models';
import { MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';

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

	return defer({
		patientOrdersListPromise: integratedCareService
			.getPatientOrders({
				pageSize: '15',
				patientOrderAssignmentStatusId: PatientOrderAssignmentStatusId.ASSIGNED,
				...filters,
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
	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('');

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

	useEffect(() => {
		patientOrdersListPromise.then((result) => {
			setTotalCount(result.totalCount);
			setTotalCountDescription(result.totalCountDescription);
		});
	}, [patientOrdersListPromise]);

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
							description={`${totalCountDescription ?? 0} Order${totalCount === 1 ? '' : 's'}`}
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
							<div>
								<MhicFilterDropdown align="start" />
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
							}}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};