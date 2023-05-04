import React, { useCallback, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import {
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
} from '@/components/integrated-care/mhic';

import useAccount from '@/hooks/use-account';
import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import { PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';

type MhicMyPatientsLoaderData = Awaited<ReturnType<typeof loader>>;

export function useMhicMyPatientsLoaderData() {
	return useRouteLoaderData('mhic-my-patients') as MhicMyPatientsLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	console.log('==> my-patients loader');

	return null;
}

export const Component = () => {
	const { account } = useAccount();
	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();
	const [searchParams, setSearchParams] = useSearchParams();
	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const accountId = account?.accountId;
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const patientOrderTriageStatusId = searchParams.get('patientOrderTriageStatusId');
	const patientOrderSafetyPlanningStatusId = searchParams.get('patientOrderSafetyPlanningStatusId');

	const fetchData = useCallback(() => {
		fetchPatientOrders({
			...(accountId && { panelAccountId: accountId }),
			...(patientOrderTriageStatusId && { patientOrderTriageStatusId }),
			...(patientOrderSafetyPlanningStatusId && { patientOrderSafetyPlanningStatusId }),
			...(pageNumber && { pageNumber }),
			pageSize: '15',
		});
	}, [accountId, fetchPatientOrders, pageNumber, patientOrderSafetyPlanningStatusId, patientOrderTriageStatusId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// useEffect(() => {
	// 	setMainViewRefresher(() => fetchData);
	// }, [fetchData, setMainViewRefresher]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	const pageTitleMap: Record<string, string> = {
		all: 'All Assigned',
		[PatientOrderTriageStatusId.NEEDS_ASSESSMENT]: 'Need Assessment',
		[PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING]: 'Safety Planning',
		[PatientOrderTriageStatusId.BHP]: 'BHP',
		[PatientOrderTriageStatusId.SPECIALTY_CARE]: 'Specialty Care',
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
								pageTitleMap[patientOrderTriageStatusId ?? patientOrderSafetyPlanningStatusId ?? 'all']
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
