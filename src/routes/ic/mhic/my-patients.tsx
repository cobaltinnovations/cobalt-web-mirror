import Cookies from 'js-cookie';
import React, { useCallback, useState } from 'react';
import { LoaderFunctionArgs, defer, redirect, useMatch, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { PatientOrderViewTypeId } from '@/lib/models';
import { PatientOrdersListResponse, integratedCareService } from '@/lib/services';
import {
	MhicCustomizeTableModal,
	MhicPageHeader,
	MhicPatientOrderTable,
	MhicSortDropdown,
	MhicShelfOutlet,
	parseMhicFilterQueryParamsFromSearchParams,
	MhicPatientOrderTableColumnConfig,
	mhicSortDropdownGetParsedQueryParams,
	MhicFilterDropdown,
	MhicFilterFlag,
	MhicFilterPractice,
	MhicFilterState,
	MhicFilterStateGetParsedQueryParams,
	MhicFilterFlagGetParsedQueryParams,
	mhicFilterPracticeGetParsedQueryParams,
} from '@/components/integrated-care/mhic';
import { useIntegratedCareLoaderData } from '../landing';
import classNames from 'classnames';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';

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
		viewTypeId?: PatientOrderViewTypeId;
		pageTitle: string;
		pageDescription: string;
		apiParameters: Record<string, string | string[]>;
		columnConfig: MhicPatientOrderTableColumnConfig;
	}
>;

const viewConfig: ViewConfig = {
	[MhicMyPatientView.All]: {
		pageTitle: 'My Patient Orders',
		pageDescription: '',
		apiParameters: {},
		columnConfig: {
			checkbox: true,
			flag: true,
			patient: true,
			referralDate: true,
			practice: true,
			referralReason: true,
			insurance: true,
			outreachNumber: true,
			lastOutreach: true,
			episode: true,
		},
	},
	[MhicMyPatientView.NeedAssessment]: {
		viewTypeId: PatientOrderViewTypeId.NEED_ASSESSMENT,
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
		viewTypeId: PatientOrderViewTypeId.SCHEDULED,
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
		viewTypeId: PatientOrderViewTypeId.SUBCLINICAL,
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
		viewTypeId: PatientOrderViewTypeId.MHP,
		pageTitle: 'MHP',
		pageDescription: 'Patients triaged to MHP',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.MHP,
		},
		columnConfig: {
			patient: true,
			flag: true,
			assessmentCompleted: true,
			// TODO
			// appointmentScheduled: true,
			// appointmentProvider: true,
			checkInResponse: true,
			episode: true,
		},
	},
	[MhicMyPatientView.SpecialtyCare]: {
		viewTypeId: PatientOrderViewTypeId.SPECIALTY_CARE,
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
		viewTypeId: PatientOrderViewTypeId.CLOSED,
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
	getResponseChecksum: () => Promise<string | undefined>;
	viewTypeId?: PatientOrderViewTypeId;
	pageTitle: string;
	pageDescription: string;
	columnConfig: MhicPatientOrderTableColumnConfig;
	patientOrdersListPromise: Promise<PatientOrdersListResponse['findResult']>;
}

export function useMhicMyPatientsLoaderData() {
	return useRouteLoaderData('mhic-my-patients') as MhicMyPatientsLoaderData;
}

function loadMyPatients({ mhicView, searchParams }: { mhicView: string; searchParams: URLSearchParams }) {
	const accountId = Cookies.get('accountId');
	const pageNumber = searchParams.get('pageNumber') ?? 0;
	const filters = parseMhicFilterQueryParamsFromSearchParams(searchParams);
	const mhicFilterStateParsedQueryParams = MhicFilterStateGetParsedQueryParams(searchParams);
	const mhicFilterFlagParsedQueryParams = MhicFilterFlagGetParsedQueryParams(searchParams);
	const mhicFilterPracticeParsedQueryParams = mhicFilterPracticeGetParsedQueryParams(searchParams);
	const mhicSortDropdownParsedQueryParams = mhicSortDropdownGetParsedQueryParams(searchParams);

	const { viewTypeId, pageTitle, pageDescription, columnConfig, apiParameters } =
		viewConfig[mhicView as MhicMyPatientView];

	const request = integratedCareService.getPatientOrders({
		...(accountId && { panelAccountId: accountId }),
		...apiParameters,
		...filters,
		pageSize: '15',
		...(pageNumber && { pageNumber }),
		...mhicFilterStateParsedQueryParams,
		...mhicFilterFlagParsedQueryParams,
		...mhicFilterPracticeParsedQueryParams,
		...mhicSortDropdownParsedQueryParams,
	});
	const responsePromise = request.fetch();

	return {
		getResponseChecksum: () => responsePromise.then(() => request.cobaltResponseChecksum),
		viewTypeId,
		pageTitle,
		pageDescription,
		columnConfig,
		patientOrdersListPromise: responsePromise.then((r) => r.findResult),
	};
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	if (!Object.keys(viewConfig).includes(params.mhicView ?? '')) {
		return redirect('/ic/mhic/my-patients/all');
	}

	const url = new URL(request.url);

	return defer(
		loadMyPatients({
			mhicView: params.mhicView as MhicMyPatientView,
			searchParams: url.searchParams,
		})
	);
}

export const Component = () => {
	const match = useMatch('/ic/mhic/my-patients/:mhicView/*');
	const shelfData = useMhicPatientOrdereShelfLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const pollingFn = useCallback(() => {
		return loadMyPatients({ mhicView: match?.params.mhicView ?? '', searchParams });
	}, [match?.params.mhicView, searchParams]);
	const { data, isLoading } = usePolledLoaderData({
		useLoaderHook: useMhicMyPatientsLoaderData,
		immediateUpdate: !!shelfData,
		pollingFn,
	});
	const { viewTypeId, pageTitle, pageDescription, columnConfig, patientOrdersListPromise } = data;

	const [showCustomizeTableModal, setShowCustomizeTableModal] = useState(false);
	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const { referenceDataResponse } = useIntegratedCareLoaderData();
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
				<Row className={classNames({ 'mb-6': !viewTypeId, 'mb-8': viewTypeId })}>
					<Col>
						<MhicPageHeader
							className={classNames({ 'mb-6': !viewTypeId })}
							title={pageTitle}
							description={pageDescription}
						>
							{viewTypeId && <MhicSortDropdown align="end" />}
						</MhicPageHeader>
						{!viewTypeId && (
							<>
								<hr className="mb-6" />
								<div className="d-flex justify-content-between align-items-center">
									<div className="d-flex align-items-center">
										<MhicFilterState className="me-2" />
										<MhicFilterFlag className="me-2" />
										<MhicFilterPractice referenceData={referenceDataResponse} className="me-2" />
										<MhicFilterDropdown align="start" />
									</div>
									<div>
										<MhicSortDropdown className="me-2" align="end" />
									</div>
								</div>
							</>
						)}
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
							columnConfig={columnConfig}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
