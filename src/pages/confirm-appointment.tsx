import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';
import { accountService, appointmentService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';

const ConfirmAppointment = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const promptForPhoneNumber = searchParams.get('promptForPhoneNumber') === 'true';
	const providerId = searchParams.get('providerId') ?? '';
	const appointmentTypeId = searchParams.get('appointmentTypeId') ?? '';
	const date = searchParams.get('date') ?? '';
	const time = searchParams.get('time') ?? '';
	const intakeAssessmentId = searchParams.get('intakeAssessmentId') ?? '';

	const { account } = useAccount();
	const handleError = useHandleError();

	const [emailInputValue, setEmailInputValue] = useState(account?.emailAddress ?? '');
	const [phoneNumberInputValue, setPhoneNumberInputValue] = useState(account?.phoneNumber ?? '');

	const [confirmationCodeRequested, setConfirmationCodeRequested] = useState(false);
	const [confirmationCodeInputValue, setConfirmationCodeInputValue] = useState('');

	const [submitting, setSubmitting] = useState(false);

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

			const response = await appointmentService
				.createAppointment({
					providerId,
					appointmentTypeId,
					date,
					time,
					intakeAssessmentId,
					emailAddress: emailInputValue,
					...(promptForPhoneNumber && { phoneNumber: phoneNumberInputValue }),
				})
				.fetch();

			navigate(`/my-calendar?appointmentId=${response.appointment.appointmentId}`, {
				state: {
					successBooking: true,
					emailAddress: response.account.emailAddress,
				},
			});
		} catch (error) {
			handleError(error);
			setSubmitting(false);
		}
	};

	return (
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
								We need your contact information to send appointment details. Please make sure it is
								entered correctly.
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
								Enter the confirmation code that was sent to {emailInputValue} to finish booking your
								appointment.
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
	);
};

export default ConfirmAppointment;
