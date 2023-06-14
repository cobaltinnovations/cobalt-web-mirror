import React, { useCallback, useEffect, useState } from 'react';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import { MhicPageHeader, MhicPatientOrderTable, MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { PatientOrderDispositionId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';

interface MhicSearchResultsLoaderData {
	getResponseChecksum: () => Promise<string | undefined>;
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicSearchResulsLoaderData() {
	return useRouteLoaderData('mhic-search-results') as MhicSearchResultsLoaderData;
}

function loadSearchResults({ searchParams }: { searchParams: URLSearchParams }) {
	const pageNumber = searchParams.get('pageNumber') ?? 0;
	const patientMrn = searchParams.get('patientMrn') ?? 0;
	const searchQuery = searchParams.get('searchQuery') ?? 0;

	const request = integratedCareService.getPatientOrders({
		...(searchQuery && { searchQuery }),
		...(patientMrn && { patientMrn }),
		...(pageNumber && { pageNumber }),
		patientOrderDispositionId: [
			PatientOrderDispositionId.OPEN,
			PatientOrderDispositionId.CLOSED,
			PatientOrderDispositionId.ARCHIVED,
		],
		pageSize: '15',
	});

	const responsePromise = request.fetch();

	return {
		getResponseChecksum: () => responsePromise.then(() => request.cobaltResponseChecksum),
		patientOrdersListPromise: responsePromise.then((r) => r.findResult),
	};
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	return defer(loadSearchResults({ searchParams: url.searchParams }));
}

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const shelfData = useMhicPatientOrdereShelfLoaderData();
	const pollingFn = useCallback(() => {
		return loadSearchResults({ searchParams });
	}, [searchParams]);
	const { data, isLoading } = usePolledLoaderData({
		useLoaderHook: useMhicSearchResulsLoaderData,
		immediateUpdate: !!shelfData,
		pollingFn,
	});
	const { patientOrdersListPromise } = data;
	const [headerDescription, setHeaderDescription] = useState('');
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

	useEffect(() => {
		patientOrdersListPromise.then((r) => {
			setHeaderDescription(`${r.totalCountDescription ?? 0} Order${r.totalCount === 1 ? '' : 's'}`);
		});
	}, [patientOrdersListPromise]);

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader
							className="mb-6"
							title={`Search Results for "${patientMrn || searchQuery}"`}
							description={headerDescription || <Spinner as="span" animation="border" size="sm" />}
						/>
					</Col>
				</Row>

				<Row>
					<Col>
						<MhicPatientOrderTable
							isLoading={isLoading}
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
