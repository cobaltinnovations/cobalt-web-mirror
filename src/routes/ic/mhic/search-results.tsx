import React, { useCallback, useEffect, useState } from 'react';
import { LoaderFunctionArgs, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { MhicPageHeader, MhicPatientOrderTable, MhicShelfOutlet } from '@/components/integrated-care/mhic';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { AnalyticsNativeEventTypeId, PatientOrderDispositionId } from '@/lib/models';
import { PatientOrdersListResponse, analyticsService, integratedCareService } from '@/lib/services';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';
import { safeIntegerValue } from '@/lib/utils/form-utils';
import useAccount from '@/hooks/use-account';

interface MhicSearchResultsLoaderData {
	getResponseChecksum: () => Promise<string | undefined>;
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicSearchResulsLoaderData() {
	return useRouteLoaderData('mhic-search-results') as MhicSearchResultsLoaderData;
}

function loadSearchResults({
	searchParams,
	isPolling = false,
}: {
	searchParams: URLSearchParams;
	isPolling?: boolean;
}) {
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

	const responsePromise = request.fetch({ isPolling });

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
	const { institution } = useAccount();
	const [searchParams, setSearchParams] = useSearchParams();
	const shelfData = useMhicPatientOrdereShelfLoaderData();
	const pollingFn = useCallback(() => {
		return loadSearchResults({ searchParams, isPolling: true });
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

	const handleTableHasLoaded = useCallback(
		(response: PatientOrdersListResponse['findResult']) => {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ORDER_SEARCH_RESULTS, {
				searchQuery,
				...(patientMrn && { patientMrn }),
				pageSize: 15,
				pageNumber: safeIntegerValue(pageNumber),
				totalCount: response.totalCount,
			});
		},
		[pageNumber, patientMrn, searchQuery]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Integrated Care - Search Results</title>
			</Helmet>

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
							hasLoadedCallback={handleTableHasLoaded}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
