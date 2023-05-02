import React, { useCallback, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useOutletContext, useSearchParams } from 'react-router-dom';

import {
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
} from '@/components/integrated-care/mhic';

import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import useAccount from '@/hooks/use-account';
import { PatientOrderStatusId } from '@/lib/models';
import { MhicLayoutContext } from './mhic-layout';

const MhicMyPatients = () => {
	const { account } = useAccount();
	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();
	const [searchParams, setSearchParams] = useSearchParams();
	const { setMainViewRefresher } = useOutletContext<MhicLayoutContext>();

	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const accountId = account?.accountId;
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const patientOrderStatusId = searchParams.get('patientOrderStatusId');
	const patientOrderDispositionId = searchParams.get('patientOrderDispositionId');

	const fetchData = useCallback(() => {
		fetchPatientOrders({
			...(accountId && { panelAccountId: accountId }),
			...(patientOrderStatusId && { patientOrderStatusId }),
			...(patientOrderDispositionId && { patientOrderDispositionId }),
			...(pageNumber && { pageNumber }),
			pageSize: '15',
		});
	}, [accountId, fetchPatientOrders, pageNumber, patientOrderDispositionId, patientOrderStatusId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		setMainViewRefresher(() => fetchData);
	}, [fetchData, setMainViewRefresher]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	const pageTitleMap: Record<PatientOrderStatusId, string> = {
		[PatientOrderStatusId.BHP]: 'BHP',
		[PatientOrderStatusId.NEEDS_ASSESSMENT]: 'Need Assessment',
		[PatientOrderStatusId.PENDING]: 'Pending',
		[PatientOrderStatusId.SAFETY_PLANNING]: 'Safety Planning',
		[PatientOrderStatusId.SPECIALTY_CARE]: 'Specialty Care',
		[PatientOrderStatusId.SUBCLINICAL]: 'Subclinical',
	};

	return (
		<>
			<MhicCustomizeTableModal
				show={showCustomizeTableModal}
				onHide={() => {
					setShowCustomizeTableModal(false);
				}}
				onSave={() => {
					setShowCustomizeTableModal(false);
				}}
			/>

			<Container fluid className="py-8">
				<Row className="mb-8">
					<Col>
						<MhicPageHeader
							title={
								patientOrderStatusId
									? pageTitleMap[patientOrderStatusId as PatientOrderStatusId]
									: 'All Assigned'
							}
							description={`${totalCountDescription ?? 0} Patients`}
						>
							<div className="d-flex align-items-center">
								<MhicFilterDropdown
									align="end"
									className="me-2"
									onApply={(selectedFilters) => {
										console.log(selectedFilters);
									}}
								/>
								<MhicSortDropdown
									align="end"
									className="me-2"
									onApply={(selectedFilters) => {
										console.log(selectedFilters);
									}}
								/>
								{/* <Button
									variant="light"
									onClick={() => {
										setShowCustomizeTableModal(true);
									}}
								>
									Customize
								</Button> */}
							</div>
						</MhicPageHeader>
					</Col>
				</Row>
				<Row>
					<Col>
						<MhicPatientOrderTable
							isLoading={isLoadingOrders}
							patientOrders={patientOrders}
							selectAll={false}
							onSelectPatientOrderIdsChange={() => {
								return;
							}}
							totalPatientOrdersCount={totalCount}
							totalPatientOrdersDescription={totalCountDescription}
							pageNumber={parseInt(pageNumber, 10)}
							pageSize={15}
							onPaginationClick={handlePaginationClick}
							columnConfig={{
								flag: true,
								patient: true,
								referralDate: true,
								practice: true,
								referralReason: true,
								assessmentStatus: true,
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default MhicMyPatients;
