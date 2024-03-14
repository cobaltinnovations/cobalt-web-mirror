import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { accountService, appointmentService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import useAccount from '@/hooks/use-account';
import AsyncPage from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import AppointmentUnavailableModal from '@/components/appointment-unavailable-modal';
import { CobaltError } from '@/lib/http-client';
import Cookies from 'js-cookie';
import moment from 'moment';
import { DateFormats } from '@/lib/utils';

const ConfirmAppointment = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const promptForPhoneNumber = searchParams.get('promptForPhoneNumber') === 'true';
	const providerId = searchParams.get('providerId') ?? '';
	const appointmentTypeId = searchParams.get('appointmentTypeId') ?? '';
	const date = searchParams.get('date') ?? '';
	const time = searchParams.get('time') ?? '';
	const intakeAssessmentId = searchParams.get('intakeAssessmentId') ?? undefined;
	const patientOrderId = searchParams.get('patientOrderId') ?? undefined;
	const epicAppointmentFhirId = searchParams.get('epicAppointmentFhirId') ?? undefined;
	const formattedTime = useMemo(() => moment(time, 'HH:mm').format(DateFormats.UI.TimeSlotInput), [time]);
	const formattedDate = useMemo(() => moment(date, 'YYYY-MM-DD').format(DateFormats.UI.Date), [date]);

	const { addFlag } = useFlags();
	const { account, isIntegratedCarePatient } = useAccount();
	const confirmationErrorHandler = useCallback((error: CobaltError) => {
		if (error.apiError?.metadata?.appointmentTimeslotUnavailable) {
			setShowUnavailableModal(true);
			return true;
		}

		return false;
	}, []);
	const handleError = useHandleError(confirmationErrorHandler);
	const icMatch = useMatch({
		path: '/ic/*',
	});

	const [emailInputValue, setEmailInputValue] = useState('');
	const [phoneNumberInputValue, setPhoneNumberInputValue] = useState(account?.phoneNumber ?? '');

	const [confirmationCodeRequested, setConfirmationCodeRequested] = useState(false);
	const [confirmationCodeInputValue, setConfirmationCodeInputValue] = useState('');

	const [submitting, setSubmitting] = useState(false);
	const [showUnavailableModal, setShowUnavailableModal] = useState(false);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const fetchData = useCallback(async () => {
		if (!account) {
			throw new Error('account is undefined.');
		}

		if (!account.emailAddress) {
			return;
		}

		const response = await accountService
			.getCheckEmailVerification(account.accountId, { emailAddress: account.emailAddress })
			.fetch();

		// If the account has previously verified their email address, prepopulate the input
		if (response.verified) {
			setEmailInputValue(account.emailAddress);
		}
	}, [account]);

	const handleContactInformationFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!account) {
				throw new Error('account is undefined.');
			}

			setSubmitting(true);

			const response = await accountService
				.postEmailVerificationCode(account.accountId, {
					emailAddress: emailInputValue,
					accountEmailVerificationFlowTypeId: 'APPOINTMENT_BOOKING',
				})
				.fetch();

			if (response.verified) {
				createAppointmentAndNavigate();
				return;
			}

			setConfirmationCodeRequested(true);
			setSubmitting(false);
			addFlag({
				variant: 'success',
				title: 'Confirmation code sent',
				description: 'Check your email for the confirmation code',
				actions: [],
			});
		} catch (error) {
			handleError(error);
			setSubmitting(false);
		}
	};

	const handleConfirmationCodeFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!account) {
				throw new Error('account is undefined.');
			}

			setSubmitting(true);

			await accountService
				.postApplyEmailVerificationCode(account.accountId, {
					emailAddress: emailInputValue,
					code: confirmationCodeInputValue,
				})
				.fetch();

			createAppointmentAndNavigate();
		} catch (error) {
			handleError(error);
			setSubmitting(false);
		}
	};

	const createAppointmentAndNavigate = async () => {
		try {
			setSubmitting(true);

			// Should we still update account before appointment creation?

			// const accountResponse = await accountService
			// 	.updateEmailAddressForAccountId(account.accountId, {
			// 		emailAddress: emailInputValue,
			// 	})
			// 	.fetch();

			// const accountResponse = await accountService
			// 	.updatePhoneNumberForAccountId(account.accountId, {
			// 		phoneNumber: phoneNumberInputValue,
			// 	})
			// 	.fetch();

			const response = await appointmentService
				.createAppointment({
					providerId,
					appointmentTypeId,
					date,
					time,
					intakeAssessmentId,
					emailAddress: emailInputValue,
					...(promptForPhoneNumber && { phoneNumber: phoneNumberInputValue }),
					...(patientOrderId && { patientOrderId }),
					...(epicAppointmentFhirId && { epicAppointmentFhirId }),
				})
				.fetch();

			if (response.appointment.patientOrderId) {
				navigate(`/ic/patient`);
			} else if (institution.epicFhirEnabled) {
				navigate(`/connect-with-support/mental-health-providers`);
			} else {
				navigate(`/my-calendar?appointmentId=${response.appointment.appointmentId}`);
			}

			Cookies.remove('bookingSource');
			Cookies.remove('bookingExitUrl');

			addFlag({
				variant: 'success',
				title: 'Your appointment is reserved',
				description: `We'll see you ${response.appointment.startTimeDescription}`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
			setSubmitting(false);
		}
	};

	const handleResendCodeButtonClick = async () => {
		try {
			if (!account) {
				throw new Error('account is undefined.');
			}

			setSubmitting(true);

			const response = await accountService
				.postEmailVerificationCode(account.accountId, {
					emailAddress: emailInputValue,
					accountEmailVerificationFlowTypeId: 'APPOINTMENT_BOOKING',
					forceVerification: true,
				})
				.fetch();

			if (response.verified) {
				createAppointmentAndNavigate();
				return;
			}

			addFlag({
				variant: 'success',
				title: 'Confirmation code sent',
				description: 'Check your email for the confirmation code',
				actions: [],
			});
		} catch (error) {
			handleError(error);
		} finally {
			setSubmitting(false);
		}
	};

	if (isIntegratedCarePatient && !icMatch) {
		return (
			<Navigate
				to={{
					pathname: '/ic/patient/confirm-appointment',
					search: `?${searchParams.toString()}`,
				}}
				replace
			/>
		);
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Confirm Appointment</title>
			</Helmet>

			<AppointmentUnavailableModal
				show={showUnavailableModal}
				onHide={() => {
					setShowUnavailableModal(false);
				}}
			/>

			{institution.integratedCareEnabled ? (
				<Container className="py-6">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h2 className="mb-4">Finish booking your appointment</h2>
							<p className="mb-6">
								Your appointment will be scheduled for {formattedTime} on {formattedDate}. If this is
								OK, press the Book Appointment button below. If you have any trouble booking your
								appointment, please call the {institution.integratedCareProgramName} Resource Center at{' '}
								{institution.integratedCarePhoneNumberDescription}{' '}
								{institution.integratedCareAvailabilityDescription}.
							</p>
							<div className="text-right">
								<Button size="lg" onClick={createAppointmentAndNavigate} disabled={submitting}>
									Book Appointment
								</Button>
							</div>
						</Col>
					</Row>
				</Container>
			) : (
				<AsyncPage fetchData={fetchData}>
					<Container className="py-6">
						<Row>
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								{!confirmationCodeRequested && (
									<>
										<h2 className="mb-4">
											{promptForPhoneNumber
												? 'Provide an email address and phone number to finish booking your appointment'
												: 'Provide an email address to finish booking your appointment'}
										</h2>

										<p className="mb-6">
											We need your contact information to send appointment details and will also
											share your name and email address with your appointment provider. Please
											make sure that your email address is entered correctly.
										</p>

										<Form onSubmit={handleContactInformationFormSubmit}>
											<InputHelper
												required
												className={promptForPhoneNumber ? 'mb-2' : 'mb-6'}
												type="email"
												value={emailInputValue}
												label="Email Address"
												autoFocus
												onChange={({ currentTarget }) => {
													setEmailInputValue(currentTarget.value);
												}}
												disabled={submitting}
											/>
											{promptForPhoneNumber && (
												<InputHelper
													required
													className="mb-6"
													type="tel"
													value={phoneNumberInputValue}
													label="Your Phone Number"
													onChange={({ currentTarget }) => {
														setPhoneNumberInputValue(currentTarget.value);
													}}
													disabled={submitting}
												/>
											)}
											<div className="text-right">
												<Button type="submit" size="lg" disabled={submitting}>
													Continue
												</Button>
											</div>
										</Form>
									</>
								)}
								{confirmationCodeRequested && (
									<>
										<h2 className="mb-4">We need to verify your email address.</h2>
										<p className="mb-6">
											Enter the confirmation code that was sent to {emailInputValue} to finish
											booking your appointment.
										</p>
										<Form onSubmit={handleConfirmationCodeFormSubmit}>
											<InputHelper
												required
												className="mb-6"
												type="text"
												value={confirmationCodeInputValue}
												label="Confirmation Code"
												onChange={({ currentTarget }) => {
													setConfirmationCodeInputValue(currentTarget.value);
												}}
												disabled={submitting}
											/>
											<div className="text-right">
												<Button
													className="me-4"
													variant="light"
													size="lg"
													onClick={handleResendCodeButtonClick}
													disabled={submitting}
												>
													Resend Code
												</Button>
												<Button type="submit" size="lg" disabled={submitting}>
													Continue
												</Button>
											</div>
										</Form>
									</>
								)}
							</Col>
						</Row>
					</Container>
				</AsyncPage>
			)}
		</>
	);
};

export default ConfirmAppointment;
