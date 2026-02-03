import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { reportingSerive, ReportType } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import DatePicker from '@/components/date-picker';
import { buildBackendDownloadUrl } from '@/lib/utils';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';

const Reports = () => {
	const { institution, account } = useAccount();
	const [reportingTypes, setReportingTypes] = useState<ReportType[]>([]);
	const [formValues, setFormValues] = useState({
		reportTypeId: '',
		startDate: '',
		endDate: '',
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
			reportTypeId: uiReportTypes[0].reportTypeId,
		}));
	}, [enabledReportTypes]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			window.location.href = buildBackendDownloadUrl('/reporting/run-report', {
				reportTypeId: formValues.reportTypeId,
				reportFormatId: 'CSV',
				startDateTime: `${formValues.startDate}T00:00:00`,
				endDateTime: `${formValues.endDate}T23:59:59`,
			});
		},
		[formValues.endDate, formValues.reportTypeId, formValues.startDate]
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
									labelText="Start Date"
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
									className="mb-4"
									labelText="End Date"
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
									<Button
										type="submit"
										size="lg"
										disabled={
											!formValues.reportTypeId || !formValues.startDate || !formValues.endDate
										}
									>
										Download Report
									</Button>
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
