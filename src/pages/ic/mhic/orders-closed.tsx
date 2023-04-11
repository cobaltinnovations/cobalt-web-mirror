import React, { useCallback, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import { MhicPageHeader, MhicPatientOrderTable } from '@/components/integrated-care/mhic';
import { PatientOrderDispositionId } from '@/lib/models';

const MhicOrdersClosed = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();

	const fetchTableData = useCallback(() => {
		return fetchPatientOrders({
			pageSize: '15',
			patientOrderDispositionId: PatientOrderDispositionId.CLOSED,
		});
	}, [fetchPatientOrders]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	useEffect(() => {
		fetchTableData();
	}, [fetchTableData]);

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-8">
					<Col>
						<MhicPageHeader
							title="Closed Orders"
							description="Closed orders will be archived after 30 days"
						/>
					</Col>
				</Row>
				<Row>
					<Col>
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
		</>
	);
};

export default MhicOrdersClosed;
