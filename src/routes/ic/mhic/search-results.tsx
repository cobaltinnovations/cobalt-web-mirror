import React, { useCallback, useEffect, useState } from 'react';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import { MhicPatientOrderTable, MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { Container } from 'react-bootstrap';
import { PatientOrderDispositionId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';

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

	const [totalCount, setTotalCount] = useState(0);
	const [totalCountDescription, setTotalCountDescription] = useState('');

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	useEffect(() => {
		patientOrdersListPromise.then((result) => {
			setTotalCount(result.totalCount);
			setTotalCountDescription(result.totalCountDescription);
		});
	}, [patientOrdersListPromise]);

	return (
		<>
			<Container fluid className="px-8">
				<div className="py-8">
					<h2>Search Results for "{patientMrn || searchQuery}" </h2>

					<p className="mb-0 text-gray fs-large fw-normal">
						{totalCountDescription} {totalCount === 1 ? 'Order' : 'Orders'}
					</p>
				</div>

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
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
