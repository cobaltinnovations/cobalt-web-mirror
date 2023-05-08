import React, { useCallback, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, redirect, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import {
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	MhicShelfOutlet,
} from '@/components/integrated-care/mhic';

import { PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import Cookies from 'js-cookie';

export enum MhicMyPatientView {
	All = 'all',
	NeedAssessment = 'need-assessment',
	SafetyPlanning = 'safety-planning',
	BHP = 'bhp',
	SpecialtyCare = 'specialty-care',
}

const viewConfig = {
	[MhicMyPatientView.All]: {
		pageTitle: 'All Assigned',
		apiParameters: {},
	},
	[MhicMyPatientView.NeedAssessment]: {
		pageTitle: 'Need Assessment',
		apiParameters: {
			patientOrderTriageStatusId: PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
		},
	},
	[MhicMyPatientView.SafetyPlanning]: {
		pageTitle: 'Safety Planning',
		apiParameters: {
			patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
		},
	},
	[MhicMyPatientView.BHP]: {
		pageTitle: 'BHP',
		apiParameters: {
			patientOrderTriageStatusId: PatientOrderTriageStatusId.BHP,
		},
	},
	[MhicMyPatientView.SpecialtyCare]: {
		pageTitle: 'Specialty Care',
		apiParameters: {
			patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
		},
	},
};

interface MhicMyPatientsLoaderData {
	pageTitle: string;
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicMyPatientsLoaderData() {
	return useRouteLoaderData('mhic-my-patients') as MhicMyPatientsLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	if (!Object.keys(viewConfig).includes(params.mhicView ?? '')) {
		return redirect('/ic/mhic/my-patients/all');
	}

	const accountId = Cookies.get('accountId');
	const pageNumber = url.searchParams.get('pageNumber') ?? 0;
	const { pageTitle, apiParameters } = viewConfig[params.mhicView as MhicMyPatientView];

	const responsePromise = integratedCareService
		.getPatientOrders({
			...(accountId && { panelAccountId: accountId }),
			...apiParameters,
			...(pageNumber && { pageNumber }),
			pageSize: '15',
		})
		.fetch();

	return defer({
		pageTitle,
		patientOrdersListPromise: responsePromise.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { pageTitle, patientOrdersListPromise } = useMhicMyPatientsLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);

	const [totalCountDescription, setTotalCountDescription] = useState('');

	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	useEffect(() => {
		patientOrdersListPromise.then((result) => {
			setTotalCountDescription(result.totalCountDescription);
		});
	}, [patientOrdersListPromise]);

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
						<MhicPageHeader title={pageTitle} description={`${totalCountDescription ?? 0} Patients`}>
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
							patientOrderFindResultPromise={patientOrdersListPromise}
							selectAll={false}
							onSelectPatientOrderIdsChange={() => {
								return;
							}}
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

			<MhicShelfOutlet />
		</>
	);
};
