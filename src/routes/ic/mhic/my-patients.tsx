import Cookies from 'js-cookie';
import React, { useCallback, useMemo, useState } from 'react';
import { LoaderFunctionArgs, redirect, useMatch, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';
import { safeIntegerValue } from '@/lib/utils/form-utils';

import {
	AnalyticsNativeEventTypeId,
	PatientOrderSortColumnId,
	PatientOrderViewTypeId,
	SortDirectionId,
} from '@/lib/models';
import { PatientOrdersListResponse, analyticsService, integratedCareService } from '@/lib/services';
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
import { decodeAccessToken } from '@/routes/auth';
import useAccount from '@/hooks/use-account';

export enum MhicMyPatientView {
	All = 'all',
	NeedAssessment = 'need-assessment',
	Scheduled = 'scheduled',
	NeedDocumentation = 'need-documentation',
	FollowUpCalls = 'follow-up-calls',
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
		pageTitle: 'Assigned Orders',
		pageDescription: '',
		apiParameters: {},
		columnConfig: {
			flag: true,
			patient: true,
			referralDate: true,
			practice: true,
			referralReason: true,
			insurance: true,
			outreachNumber: true,
			lastContact: true,
			nextContact: true,
			nextContactType: true,
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
			lastContact: true,
			nextContact: true,
			nextContactType: true,
			consent: true,
			episode: true,
		},
	},
	[MhicMyPatientView.FollowUpCalls]: {
		viewTypeId: PatientOrderViewTypeId.SCHEDULED_OUTREACH,
		pageTitle: 'Scheduled Calls',
		pageDescription: 'Patients that you are scheduled to call',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.SCHEDULED_OUTREACH,
			patientOrderSortColumnId: PatientOrderSortColumnId.NEXT_CONTACT_SCHEDULED_AT,
			sortDirectionId: SortDirectionId.ASCENDING,
		},
		columnConfig: {
			patient: true,
			flag: true,
			lastContact: true,
			nextContact: true,
			nextContactType: true,
			assessmentCompleted: true,
			triage: true,
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
	[MhicMyPatientView.NeedDocumentation]: {
		viewTypeId: PatientOrderViewTypeId.NEED_DOCUMENTATION,
		pageTitle: 'Missing Documentation',
		pageDescription: 'Orders that need attention in Epic',
		apiParameters: {
			patientOrderViewTypeId: PatientOrderViewTypeId.NEED_DOCUMENTATION,
		},
		columnConfig: {
			patient: true,
			flag: true,
			referralDate: true,
			practice: true,
			insurance: true,
			referralReason: true,
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

function loadMyPatients(
	{ mhicView, searchParams }: { mhicView: string; searchParams: URLSearchParams },
	isPolling = false
) {
	const accessToken = Cookies.get('accessToken');

	if (!accessToken) {
		throw new Error('Not authenticated');
	}

	const { accountId } = decodeAccessToken(accessToken);
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
	const responsePromise = request.fetch({ isPolling });

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

	return loadMyPatients({
		mhicView: params.mhicView as MhicMyPatientView,
		searchParams: url.searchParams,
	});
}

export const Component = () => {
	const match = useMatch('/ic/mhic/my-patients/:mhicView/*');
	const shelfData = useMhicPatientOrdereShelfLoaderData();
	const [searchParams, setSearchParams] = useSearchParams();
	const pollingFn = useCallback(() => {
		return loadMyPatients({ mhicView: match?.params.mhicView ?? '', searchParams }, true);
	}, [match?.params.mhicView, searchParams]);
	const { data, isLoading } = usePolledLoaderData({
		useLoaderHook: useMhicMyPatientsLoaderData,
		immediateUpdate: !!shelfData,
		pollingFn,
	});
	const { viewTypeId, pageTitle, pageDescription, columnConfig, patientOrdersListPromise } = data;
	const { institution } = useAccount();

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

	const analyticsEvents: Record<MhicMyPatientView, (response: PatientOrdersListResponse['findResult']) => void> =
		useMemo(() => {
			// pageSize is hard coded to 15 on this page, see <MhicPatientOrderTable/> component below.
			const pageSize = 15;
			const sortDirectionId = searchParams.get('sortDirectionId') ?? '';
			const patientOrderSortColumnId = searchParams.get('patientOrderSortColumnId') ?? '';

			return {
				[MhicMyPatientView.All]: (response) => {
					const patientOrderOutreachStatusId = searchParams.get('patientOrderOutreachStatusId') ?? '';
					const patientOrderScreeningStatusId = searchParams.get('patientOrderScreeningStatusId') ?? '';
					const patientOrderScheduledScreeningScheduledDate =
						searchParams.get('patientOrderScheduledScreeningScheduledDate') ?? '';
					const patientOrderResourcingStatusId = searchParams.get('patientOrderResourcingStatusId') ?? '';
					const patientOrderResourceCheckInResponseStatusId =
						searchParams.get('patientOrderResourceCheckInResponseStatusId') ?? '';
					const patientOrderAssignmentStatusId = searchParams.get('patientOrderAssignmentStatusId') ?? '';
					const patientOrderDispositionId = searchParams.get('patientOrderDispositionId') ?? '';
					const referringPracticeIds = searchParams.getAll('referringPracticeIds') ?? [];
					const patientOrderFilterFlagTypeIds = searchParams.getAll('flag') ?? [];

					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS, {
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						...(patientOrderOutreachStatusId && { patientOrderOutreachStatusId }),
						...(patientOrderScreeningStatusId && { patientOrderScreeningStatusId }),
						...(patientOrderScheduledScreeningScheduledDate && {
							patientOrderScheduledScreeningScheduledDate,
						}),
						...(patientOrderResourcingStatusId && { patientOrderResourcingStatusId }),
						...(patientOrderResourceCheckInResponseStatusId && {
							patientOrderResourceCheckInResponseStatusId,
						}),
						...(patientOrderAssignmentStatusId && { patientOrderAssignmentStatusId }),
						...(patientOrderDispositionId && { patientOrderDispositionId }),
						...(referringPracticeIds.length > 0 && { referringPracticeIds }),
						...(patientOrderFilterFlagTypeIds.length > 0 && { patientOrderFilterFlagTypeIds }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount: response.totalCount,
					});
				},
				[MhicMyPatientView.Closed]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.CLOSED,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.FollowUpCalls]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.SCHEDULED_OUTREACH,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.MHP]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.MHP,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.NeedAssessment]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.NEED_ASSESSMENT,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.NeedDocumentation]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.NEED_DOCUMENTATION,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.Scheduled]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.SCHEDULED,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.SpecialtyCare]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.SPECIALTY_CARE,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
				[MhicMyPatientView.Subclinical]: ({ totalCount }) => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_MHIC_ASSIGNED_ORDERS_VIEW, {
						patientOrderViewTypeId: PatientOrderViewTypeId.SUBCLINICAL,
						...(patientOrderSortColumnId && { patientOrderSortColumnId }),
						...(sortDirectionId && { sortDirectionId }),
						pageNumber: safeIntegerValue(pageNumber),
						pageSize,
						totalCount,
					});
				},
			};
		}, [pageNumber, searchParams]);

	const handleTableHasLoaded = useCallback(
		(response: PatientOrdersListResponse['findResult']) => {
			const mhicView = match?.params.mhicView;
			analyticsEvents[mhicView as MhicMyPatientView](response);
		},
		[analyticsEvents, match?.params.mhicView]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Integrated Care - My Patients</title>
			</Helmet>

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
							hasLoadedCallback={handleTableHasLoaded}
						/>
					</Col>
				</Row>
			</Container>

			<MhicShelfOutlet />
		</>
	);
};
