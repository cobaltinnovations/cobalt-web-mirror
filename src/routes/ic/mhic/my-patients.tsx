import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, defer, redirect, useRouteLoaderData, useSearchParams } from 'react-router-dom';

import {
	MhicCustomizeTableModal,
	MhicFilterDropdown,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	MhicShelfOutlet,
	parseMhicFilterQueryParamsFromURL,
	MhicPatientOrderTableColumnConfig,
} from '@/components/integrated-care/mhic';

import { PatientOrderViewTypeId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import Cookies from 'js-cookie';
import { AwaitedString } from '@/components/awaited-string';

export enum MhicMyPatientView {
	All = 'all',
	NeedAssessment = 'need-assessment',
	Scheduled = 'scheduled',
	Subclinical = 'subclinical',
	MHP = 'mhp',
	SpecialtyCare = 'specialty-care',
	Closed = 'closed',
}

type ViewConfig = Record<
	MhicMyPatientView,
	{
		pageTitle: string;
		apiParameters: Record<string, string | string[]>;
		columnConfig: MhicPatientOrderTableColumnConfig;
	}
>;

const viewConfig: ViewConfig = {
	[MhicMyPatientView.All]: {
		pageTitle: 'All Assigned',
		apiParameters: {},
		columnConfig: {
			patient: true,
			flag: true,
			referralDate: true,
			practice: true,
			referralReason: true,
			insurance: true,
			episode: true,
		},
	},
	[MhicMyPatientView.NeedAssessment]: {
		pageTitle: 'Need Assessment',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.NEED_ASSESSMENT,
		},
		columnConfig: {
			patient: true,
			flag: true,
			referralDate: true,
			practice: true,
			insurance: true,
			outreachNumber: true,
			lastOutreach: true,
			consent: true,
			episode: true,
		},
	},
	[MhicMyPatientView.Scheduled]: {
		pageTitle: 'Scheduled',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.SCHEDULED,
		},
		columnConfig: {
			patient: true,
			flag: true,
			referralDate: true,
			practice: true,
			referralReason: true,
			assessmentScheduled: true,
			episode: true,
		},
	},
	[MhicMyPatientView.Subclinical]: {
		pageTitle: 'Subclinical',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.SUBCLINICAL,
		},
		columnConfig: {
			patient: true,
			flag: true,
			assessmentCompleted: true,
			resources: true,
			checkInScheduled: true,
			checkInResponse: true,
			episode: true,
		},
	},
	[MhicMyPatientView.MHP]: {
		pageTitle: 'MHP',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.MHP,
		},
		columnConfig: {
			patient: true,
			flag: true,
			assessmentCompleted: true,
			//appointmentScheduled: true,
			//appointmentProvider: true,
			checkInResponse: true,
			episode: true,
		},
	},
	[MhicMyPatientView.SpecialtyCare]: {
		pageTitle: 'Specialty Care',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.SPECIALTY_CARE,
		},
		columnConfig: {
			patient: true,
			flag: true,
			assessmentCompleted: true,
			resources: true,
			checkInScheduled: true,
			checkInResponse: true,
			episode: true,
		},
	},
	[MhicMyPatientView.Closed]: {
		pageTitle: 'Closed',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.CLOSED,
		},
		columnConfig: {
			patient: true,
			flag: true,
			assessmentCompleted: true,
			resources: true,
			checkInScheduled: true,
			checkInResponse: true,
			episode: true,
		},
	},
};

interface MhicMyPatientsLoaderData {
	pageTitle: string;
	columnConfig: MhicPatientOrderTableColumnConfig;
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
	const filters = parseMhicFilterQueryParamsFromURL(url);
	const { pageTitle, columnConfig, apiParameters } = viewConfig[params.mhicView as MhicMyPatientView];

	const responsePromise = integratedCareService
		.getPatientOrders({
			...(accountId && { panelAccountId: accountId }),
			...apiParameters,
			...filters,
			...(pageNumber && { pageNumber }),
			pageSize: '15',
		})
		.fetch();

	return defer({
		pageTitle,
		columnConfig,
		patientOrdersListPromise: responsePromise.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { pageTitle, columnConfig, patientOrdersListPromise } = useMhicMyPatientsLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);
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
							title={pageTitle}
							description={
								<AwaitedString
									resolve={patientOrdersListPromise.then((result) => {
										return `${result.totalCountDescription} Patient${
											result.totalCount === 1 ? '' : 's'
										}`;
									})}
								/>
							}
						>
							<div className="d-flex align-items-center">
								<MhicFilterDropdown align="end" className="me-2" />
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
							columnConfig={columnConfig}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
