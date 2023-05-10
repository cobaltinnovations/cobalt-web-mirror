import React, { useCallback } from 'react';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import { MhicPageHeader, MhicPatientOrderTable, MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { Col, Container, Row } from 'react-bootstrap';
import { PatientOrderDispositionId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import { AwaitedString } from '@/components/awaited-string';

interface MhicSearchResultsLoaderData {
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicSearchResulsLoaderData() {
	return useRouteLoaderData('mhic-search-results') as MhicSearchResultsLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const pageNumber = url.searchParams.get('pageNumber') ?? 0;
	const patientMrn = url.searchParams.get('patientMrn') ?? 0;
	const searchQuery = url.searchParams.get('searchQuery') ?? 0;

	const responsePromise = integratedCareService
		.getPatientOrders({
			...(searchQuery && { searchQuery }),
			...(patientMrn && { patientMrn }),
			...(pageNumber && { pageNumber }),
			patientOrderDispositionId: [
				PatientOrderDispositionId.OPEN,
				PatientOrderDispositionId.CLOSED,
				PatientOrderDispositionId.ARCHIVED,
			],
			pageSize: '15',
		})
		.fetch();

	return defer({
		patientOrdersListPromise: responsePromise.then((r) => r.findResult),
	});
}

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { patientOrdersListPromise } = useMhicSearchResulsLoaderData();
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const patientMrn = searchParams.get('patientMrn');
	const searchQuery = searchParams.get('searchQuery');

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
							className="mb-6"
							title={`Search Results for "${patientMrn || searchQuery}"`}
							description={
								<AwaitedString
									resolve={patientOrdersListPromise.then((r) => {
										return `${r.totalCountDescription ?? 0} Order${r.totalCount === 1 ? '' : 's'}`;
									})}
								/>
							}
						/>
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
								mrn: true,
								preferredPhone: true,
								practice: true,
								orderState: true,
								assignedMhic: true,
							}}
							coloredRows
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
