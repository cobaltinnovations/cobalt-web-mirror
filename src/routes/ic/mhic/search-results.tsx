import React, { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { MhicPatientOrderTable } from '@/components/integrated-care/mhic';
import { Container } from 'react-bootstrap';
import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';

const MhicSearchResults = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();

	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const searchQuery = searchParams.get('searchQuery');

	useEffect(() => {
		fetchPatientOrders({
			...(pageNumber && { pageNumber }),
		});
	}, [fetchPatientOrders, pageNumber]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<Container fluid className="px-8">
			<div className="py-8 d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-end">
					<h2 className="m-0">
						Search Results for "{searchQuery}"
						<span className="text-gray fs-large fw-normal">
							{totalCountDescription} {totalCount === 1 ? 'Order' : 'Orders'}
						</span>
					</h2>
				</div>
			</div>

			<MhicPatientOrderTable
				isLoading={isLoadingOrders}
				patientOrders={patientOrders}
				selectAll={false}
				totalPatientOrdersCount={totalCount}
				totalPatientOrdersDescription={totalCountDescription}
				pageNumber={parseInt(pageNumber, 10)}
				pageSize={15}
				onPaginationClick={handlePaginationClick}
				columnConfig={{
					checkbox: false,
					flag: true,
					patient: true,
					referralDate: true,
					practice: true,
					referralReason: true,
					outreachNumber: true,
					episode: true,
				}}
			/>
		</Container>
	);
};

export default MhicSearchResults;
