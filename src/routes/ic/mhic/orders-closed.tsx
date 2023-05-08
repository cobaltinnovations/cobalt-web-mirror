import React, { useCallback } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import {
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicShelfOutlet,
	MhicSortDropdown,
	parseMhicFilterQueryParamsFromURL,
} from '@/components/integrated-care/mhic';
import { PatientOrderDispositionId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';

interface MhicOrdersClosedLoaderData {
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicOrdersClosedLoaderData() {
	return useRouteLoaderData('mhic-orders-closed') as MhicOrdersClosedLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const pageNumber = url.searchParams.get('pageNumber') ?? 0;
	const filters = parseMhicFilterQueryParamsFromURL(url);

	return defer({
		patientOrdersListPromise: integratedCareService
			.getPatientOrders({
				pageSize: '15',
				patientOrderDispositionId: PatientOrderDispositionId.CLOSED,
				...filters,
				...(pageNumber && { pageNumber }),
			})
			.fetch()
			.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { patientOrdersListPromise } = useMhicOrdersClosedLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader
							title="Closed Orders"
							description="Closed orders will be archived after 30 days"
						/>
					</Col>
				</Row>
				<Row className="mb-8">
					<Col>
						<div className="d-flex justify-content-between align-items-center">
							<MhicFilterDropdown align="start" />
							<MhicSortDropdown
								align="end"
								onApply={(selectedFilters) => {
									console.log(selectedFilters);
								}}
							/>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<MhicPatientOrderTable
							patientOrderFindResultPromise={patientOrdersListPromise}
							selectAll={false}
							pageNumber={parseInt(pageNumber, 10)}
							pageSize={15}
							onPaginationClick={handlePaginationClick}
							columnConfig={{
								patient: true,
								referralDate: true,
								practice: true,
								// closureDate: true,
								// reasonForClosed: true,
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
