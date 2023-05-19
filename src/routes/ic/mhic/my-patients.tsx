import Cookies from 'js-cookie';
import React, { useCallback, useState } from 'react';
import { LoaderFunctionArgs, defer, redirect, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { PatientOrderViewTypeId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import {
	MhicCustomizeTableModal,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	MhicShelfOutlet,
	parseMhicFilterQueryParamsFromURL,
	MhicPatientOrderTableColumnConfig,
	mhicSortDropdownGetParsedQueryParams,
} from '@/components/integrated-care/mhic';

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
		pageDescription: string;
		apiParameters: Record<string, string | string[]>;
		columnConfig: MhicPatientOrderTableColumnConfig;
	}
>;

const viewConfig: ViewConfig = {
	[MhicMyPatientView.All]: {
		pageTitle: 'All Assigned',
		pageDescription: '',
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
		pageDescription: 'Patients that have not started or been scheduled for an assessment',
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
		pageDescription: 'Patients scheduled to take the assessment by phone',
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
		pageDescription: 'Patients triaged to subclinical',
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
		pageDescription: 'Patients triaged to MHP',
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
		pageDescription: 'Patients triaged to specialty care',
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
		pageDescription: 'Orders that have been closed. Order closed for more than 30 days will be archived.',
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
	pageDescription: string;
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
	const { pageTitle, pageDescription, columnConfig, apiParameters } =
		viewConfig[params.mhicView as MhicMyPatientView];
	const mhicSortDropdownParsedQueryParams = mhicSortDropdownGetParsedQueryParams(url);

	const responsePromise = integratedCareService
		.getPatientOrders({
			...(accountId && { panelAccountId: accountId }),
			...apiParameters,
			...filters,
			...(pageNumber && { pageNumber }),
			pageSize: '15',
			...mhicSortDropdownParsedQueryParams,
		})
		.fetch();

	return defer({
		pageTitle,
		pageDescription,
		columnConfig,
		patientOrdersListPromise: responsePromise.then((r) => r.findResult),
	});
}

export const Component = () => {
	const { pageTitle, pageDescription, columnConfig, patientOrdersListPromise } = useMhicMyPatientsLoaderData();
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
						<MhicPageHeader title={pageTitle} description={pageDescription}>
							<MhicSortDropdown align="end" />
						</MhicPageHeader>
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
							columnConfig={columnConfig}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
