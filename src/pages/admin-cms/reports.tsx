import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { reportingSerive, ReportType, ReportTypeId } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import DatePicker from '@/components/date-picker';
import LoadingButton from '@/components/loading-button';
import { CobaltError } from '@/lib/http-client';
import { buildBackendDownloadUrl, downloadBlob, filenameFromContentDisposition } from '@/lib/utils';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';

const Reports = () => {
	const { institution, account } = useAccount();
	const [reportingTypes, setReportingTypes] = useState<ReportType[]>([]);
	const [isDownloading, setIsDownloading] = useState(false);
	const handleError = useHandleError();
	const [formValues, setFormValues] = useState({
		reportTypeId: '',
		startDate: '',
		endDate: '',
		accountId: '',
	});

	const enabledReportTypes = useMemo(() => {
		return {
			PROVIDER_UNUSED_AVAILABILITY: account?.accountCapabilityFlags.canViewProviderReportUnusedAvailability,
			PROVIDER_APPOINTMENTS: true,
			PROVIDER_APPOINTMENT_CANCELATIONS:
				account?.accountCapabilityFlags.canViewProviderReportAppointmentCancelations,
			PROVIDER_APPOINTMENTS_EAP: account?.accountCapabilityFlags.canViewProviderReportAppointmentsEap,
			SIGN_IN_PAGEVIEW_NO_ACCOUNT: account?.accountCapabilityFlags.canViewAnalytics,
			ACCOUNT_SIGNUP_UNVERIFIED: account?.accountCapabilityFlags.canViewAnalytics,
			ACCOUNT_ONBOARDING_INCOMPLETE: account?.accountCapabilityFlags.canViewAnalytics,
			ACCOUNT_ONBOARDING_COMPLETE: account?.accountCapabilityFlags.canViewAnalytics,
			ACCOUNT_ONBOARDING_COMPLETE_V2: account?.accountCapabilityFlags.canViewAnalytics,
			// Authorization for this report is determined exclusively by report-types.
			ACCOUNT_GEOLOCATION: true,
			COURSE_FEEDBACK: account?.accountCapabilityFlags.canViewAnalytics,
			COURSE_MCB_DOWNLOAD: account?.accountCapabilityFlags.canViewAnalytics,
			ACCOUNT_TIMELINE: account?.accountCapabilityFlags.canViewAnalytics,
		} as Record<string, boolean>;
	}, [
		account?.accountCapabilityFlags.canViewProviderReportAppointmentCancelations,
		account?.accountCapabilityFlags.canViewProviderReportAppointmentsEap,
		account?.accountCapabilityFlags.canViewProviderReportUnusedAvailability,
		account?.accountCapabilityFlags.canViewAnalytics,
	]);

	const fetchData = useCallback(async () => {
		const response = await reportingSerive.getReportTypes().fetch();

		const uiReportTypes = response.reportTypes.filter((rt) => enabledReportTypes[rt.reportTypeId]);
		setReportingTypes(uiReportTypes);

		setFormValues((previousValues) => ({
			...previousValues,
			reportTypeId: uiReportTypes[0]?.reportTypeId ?? '',
		}));
	}, [enabledReportTypes]);

	const isAccountTimelineReport = formValues.reportTypeId === ReportTypeId.ACCOUNT_TIMELINE;
	const isAccountGeolocationReport = formValues.reportTypeId === ReportTypeId.ACCOUNT_GEOLOCATION;
	const hasInvalidDateRange = Boolean(
		formValues.startDate && formValues.endDate && moment(formValues.startDate).isAfter(formValues.endDate, 'day')
	);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (isDownloading || hasInvalidDateRange) {
				return;
			}

			const startDateTime = formValues.startDate ? `${formValues.startDate}T00:00:00` : undefined;
			const endDateTime = formValues.endDate ? `${formValues.endDate}T23:59:59.999999` : undefined;

			if (isAccountGeolocationReport && startDateTime && endDateTime) {
				setIsDownloading(true);

				try {
					const reportRequest = reportingSerive.runReport({
						reportTypeId: ReportTypeId.ACCOUNT_GEOLOCATION,
						reportFormatId: 'CSV',
						startDateTime,
						endDateTime,
					});
					const blob = await reportRequest.fetch();
					const filename = filenameFromContentDisposition(
						reportRequest.responseHeaders?.['content-disposition'],
						'Cobalt ACCOUNT_GEOLOCATION.csv'
					);

					downloadBlob(blob, filename);
				} catch (error) {
					if (error instanceof CobaltError && error.axiosError?.response?.status === 403) {
						try {
							await fetchData();
						} catch (ignored) {
							// Preserve the original authorization error for the standard error handler.
						}
					}

					handleError(error);
				} finally {
					setIsDownloading(false);
				}

				return;
			}

			window.location.href = buildBackendDownloadUrl('/reporting/run-report', {
				reportTypeId: formValues.reportTypeId,
				reportFormatId: 'CSV',
				...(startDateTime ? { startDateTime } : {}),
				...(endDateTime ? { endDateTime } : {}),
				...(formValues.reportTypeId === ReportTypeId.ACCOUNT_TIMELINE && formValues.accountId
					? { accountId: formValues.accountId }
					: {}),
			});
		},
		[
			fetchData,
			formValues.accountId,
			formValues.endDate,
			formValues.reportTypeId,
			formValues.startDate,
			handleError,
			hasInvalidDateRange,
			isAccountGeolocationReport,
			isDownloading,
		]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Reports</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Container fluid className="px-8 py-8">
					<Row className="mb-6">
						<Col>
							<div className="mb-6 d-flex align-items-center justify-content-between">
								<h2 className="mb-0">Reports</h2>
							</div>
							<hr />
						</Col>
					</Row>
				</Container>
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<Form className="p-8 pb-10 bg-white border rounded" onSubmit={handleFormSubmit}>
								<InputHelper
									className="mb-4"
									as="select"
									label="Report Type"
									value={formValues.reportTypeId}
									onChange={({ currentTarget }) => {
										setFormValues((previousValues) => ({
											...previousValues,
											reportTypeId: currentTarget.value,
										}));
									}}
									required
								>
									{reportingTypes.map((rt) => (
										<option key={rt.reportTypeId} value={rt.reportTypeId}>
											{rt.description}
										</option>
									))}
								</InputHelper>
								<DatePicker
									className="mb-4"
									labelText={isAccountTimelineReport ? 'Optional Start Date' : 'Start Date'}
									showYearDropdown
									showMonthDropdown
									dropdownMode="select"
									selected={
										formValues.startDate
											? moment(formValues.startDate, 'YYYY-MM-DD').toDate()
											: undefined
									}
									onChange={(date) => {
										if (!date) {
											return;
										}

										setFormValues((previousValues) => ({
											...previousValues,
											startDate: moment(date).format('YYYY-MM-DD'),
										}));
									}}
								/>
								<DatePicker
									className={hasInvalidDateRange ? 'mb-2' : 'mb-4'}
									labelText={isAccountTimelineReport ? 'Optional End Date' : 'End Date'}
									showYearDropdown
									showMonthDropdown
									dropdownMode="select"
									selected={
										formValues.endDate
											? moment(formValues.endDate, 'YYYY-MM-DD').toDate()
											: undefined
									}
									onChange={(date) => {
										if (!date) {
											return;
										}

										setFormValues((previousValues) => ({
											...previousValues,
											endDate: moment(date).format('YYYY-MM-DD'),
										}));
									}}
								/>
								{hasInvalidDateRange && (
									<p className="mb-4 text-danger fs-small" role="alert">
										Start Date must be on or before End Date.
									</p>
								)}
								{isAccountTimelineReport && (
									<>
										<InputHelper
											className="mb-4"
											label="Account ID"
											type="text"
											placeholder="UUID for the account to inspect"
											value={formValues.accountId}
											onChange={({ currentTarget }) => {
												setFormValues((previousValues) => ({
													...previousValues,
													accountId: currentTarget.value,
												}));
											}}
											required
										/>
										<p className="text-muted">
											Leave the date fields blank to export the full timeline for this account.
										</p>
									</>
								)}
								{isAccountGeolocationReport && (
									<p className="text-muted">
										IP geolocation enrichment begins nightly at 11:00 PM Eastern. Newly observed
										addresses may remain pending until the next nightly run finishes.
									</p>
								)}
								<p>
									Patient privacy is our highest priority at Cobalt. If you chose to download reports,
									the information is only to be used for internal analysis, reporting or
									reconciliation.
								</p>
								<p>
									Personally identifiable information should never be shared outside of the Cobalt
									team and its partners, and never shared via email.
								</p>

								{institution.secureFilesharingPlatformName &&
									institution.secureFilesharingPlatformUrl && (
										<p>
											Please always use{' '}
											<a
												href={institution.secureFilesharingPlatformUrl}
												target="_blank"
												rel="noreferrer noopener"
											>
												{institution.secureFilesharingPlatformName}
											</a>{' '}
											if and when you need to share PHI, and only under very limited
											circumstances. Thank you.
										</p>
									)}

								<div className="text-right">
									<LoadingButton
										type="submit"
										size="sm"
										isLoading={isDownloading}
										disabled={
											isDownloading ||
											hasInvalidDateRange ||
											!formValues.reportTypeId ||
											(isAccountTimelineReport
												? !formValues.accountId
												: !formValues.startDate || !formValues.endDate)
										}
									>
										Download Report
									</LoadingButton>
								</div>
							</Form>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default Reports;
