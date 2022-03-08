import { BookingContext, BookingSource } from '@/contexts/booking-context';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { AvailabilityTimeSlot, Provider } from '@/lib/models';
import { accountService, CreateAppointmentData, appointmentService } from '@/lib/services';
import React, { useCallback, useContext, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import CollectContactInfoModal from './collect-contact-info-modal';
import ConfirmAppointmentTypeModal from './confirm-appointment-type-modal';
import ConfirmIntakeAssessmentModal from './confirm-intake-assessment-modal';
import ConfirmProviderBookingModal from './confirm-provider-booking-modal';

export type KickoffBookingOptions = {
	source: BookingSource;
	provider: Provider;
	date: string;
	timeSlot: AvailabilityTimeSlot;
};

export type ContinueBookingOptions = {
	provider?: Provider;
	requireAssessment?: boolean;
	promptForInfo?: boolean;
};

export type BookingRefHandle = {
	kickoffBookingProcess: (options: KickoffBookingOptions) => void;
	continueBookingProcess: (options: ContinueBookingOptions) => void;
};

interface HistoryLocationState {
	skipAssessment?: boolean;
	successBooking?: boolean;
	routedClinicIds?: string[];
	routedProviderId?: string;
	routedSupportRoleIds?: string[];
	emailAddress?: string;
}

export const BookingModals = forwardRef<BookingRefHandle>((props, ref) => {
	const handleError = useHandleError();
	const { account, setAccount, isAnonymous } = useAccount();
	const history = useHistory<HistoryLocationState>();

	const [collectedPhoneNumebr, setCollectedPhoneNumber] = useState(account?.phoneNumber ?? '');
	const [collectedEmail, setCollectedEmail] = useState(account?.emailAddress ?? '');

	const [isBooking, setIsBooking] = useState(false);
	const [isSavingInfo, setIsSavingInfo] = useState(false);
	const [showCollectInfoModal, setShowCollectInfoModal] = useState(false);
	const [showConfirmAppointmentTypeModal, setShowConfirmAppointmentTypeModal] = useState(false);
	const [showConfirmIntakeAssessmentModal, setShowConfirmIntakeAssessmentModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const {
		appointmentTypes,
		epicDepartments,
		availableSections,
		setAvailableSections,

		selectedAppointmentTypeId,
		setSelectedAppointmentTypeId,
		selectedDate,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,
		timeSlotEndTime,
		formattedAvailabilityDate,
		formattedModalDate,

		promptForEmail,
		setPromptForEmail,
		promptForPhoneNumber,
		setPromptForPhoneNumber,

		bookingSource,
		setBookingSource,
		setPreserveFilters,
	} = useContext(BookingContext);

	const skipAssessment = !!history.location.state?.skipAssessment;
	const navigateToEhrLookup = useCallback(() => {
		history.push(`/ehr-lookup`, {
			skipAssessment,
		});
	}, [history, skipAssessment]);

	const navigateToIntakeAssessment = useCallback(
		(provider: Provider) => {
			if (!provider) {
				return;
			}

			history.push(`/intake-assessment?providerId=${provider.providerId}`, {
				skipAssessment,
			});
		},
		[history, skipAssessment]
	);

	const continueBookingProcess = useCallback(
		({ provider, requireAssessment = false, promptForInfo = false }: ContinueBookingOptions) => {
			if (provider?.schedulingSystemId === 'EPIC' && !account?.epicPatientId) {
				setPreserveFilters(bookingSource === BookingSource.ProviderSearch);
				navigateToEhrLookup();
			} else if (provider?.intakeAssessmentRequired && provider?.skipIntakePrompt) {
				setPreserveFilters(bookingSource === BookingSource.ProviderSearch);
				navigateToIntakeAssessment(provider);
			} else if (provider?.intakeAssessmentRequired || requireAssessment) {
				setShowConfirmIntakeAssessmentModal(true);
			} else if (promptForInfo || promptForEmail || promptForPhoneNumber) {
				setShowCollectInfoModal(true);
			} else {
				setShowConfirmationModal(true);
			}
		},
		[
			account?.epicPatientId,
			bookingSource,
			navigateToEhrLookup,
			navigateToIntakeAssessment,
			promptForEmail,
			promptForPhoneNumber,
			setPreserveFilters,
		]
	);

	const kickoffBookingProcess = useCallback(
		({ source, provider, date, timeSlot }: KickoffBookingOptions) => {
			setBookingSource(source);
			setSelectedProvider(provider);
			setSelectedDate(date);
			setSelectedTimeSlot(timeSlot);

			// const needsEmail = isAnonymous || !account?.emailAddress;
			const needsEmail = true;
			const needsPhoneNumber =
				!!provider.phoneNumberRequiredForAppointment && (isAnonymous || !account?.phoneNumber);

			setPromptForEmail(needsEmail);
			setPromptForPhoneNumber(needsPhoneNumber);

			if (provider.appointmentTypeIds.length === 1) {
				const confirmedApptType = appointmentTypes.find(
					(aT) => aT.appointmentTypeId === provider.appointmentTypeIds[0]
				);

				if (confirmedApptType && confirmedApptType.visitTypeId === 'FOLLOWUP') {
					if (
						!window.confirm(
							'Do you understand that this appointment is reserved for individuals that have met with this provider before?'
						)
					) {
						return;
					}
				}

				setSelectedAppointmentTypeId(confirmedApptType?.appointmentTypeId);
				continueBookingProcess({
					provider,
					requireAssessment: !!confirmedApptType?.assessmentId,
					promptForInfo: needsEmail || needsPhoneNumber,
				});
			} else {
				setShowConfirmAppointmentTypeModal(true);
			}
		},
		[
			account?.phoneNumber,
			appointmentTypes,
			continueBookingProcess,
			isAnonymous,
			setPromptForEmail,
			setPromptForPhoneNumber,
			setSelectedAppointmentTypeId,
			setSelectedDate,
			setSelectedProvider,
			setSelectedTimeSlot,
		]
	);

	useImperativeHandle(ref, () => {
		return {
			kickoffBookingProcess,
			continueBookingProcess,
		};
	});

	useEffect(() => {
		if (account?.emailAddress) {
			setCollectedEmail(account.emailAddress);
		}

		if (account?.phoneNumber) {
			setCollectedPhoneNumber(account.phoneNumber);
		}
	}, [account]);

	return (
		<>
			<CollectContactInfoModal
				promptForEmail={promptForEmail}
				promptForPhoneNumber={promptForPhoneNumber}
				show={showCollectInfoModal}
				collectedEmail={collectedEmail}
				collectedPhoneNumber={collectedPhoneNumebr}
				onHide={() => {
					setShowCollectInfoModal(false);
				}}
				onSubmit={async ({ email, phoneNumber }) => {
					if (!account || isSavingInfo) {
						return;
					}

					setIsSavingInfo(true);

					try {
						if (promptForEmail) {
							const accountResponse = await accountService
								.updateEmailAddressForAccountId(account.accountId, {
									emailAddress: email,
								})
								.fetch();

							setCollectedEmail(email);
							setAccount(accountResponse.account);
						}

						if (promptForPhoneNumber) {
							const accountResponse = await accountService
								.updatePhoneNumberForAccountId(account.accountId, {
									phoneNumber,
								})
								.fetch();

							setCollectedPhoneNumber(phoneNumber);
							setAccount(accountResponse.account);
						}

						setShowCollectInfoModal(false);
						setShowConfirmationModal(true);
					} catch (error) {
						handleError(error);
					}

					setIsSavingInfo(false);
				}}
			/>

			<ConfirmAppointmentTypeModal
				show={showConfirmAppointmentTypeModal}
				appointmentTypes={appointmentTypes
					.filter((aT) => selectedProvider?.appointmentTypeIds?.includes(aT.appointmentTypeId))
					.map((aT) => ({
						...aT,
						disabled: !selectedTimeSlot?.appointmentTypeIds?.includes(aT.appointmentTypeId),
					}))}
				epicDepartment={epicDepartments.find(
					(eD) => eD.epicDepartmentId === selectedTimeSlot?.epicDepartmentId
				)}
				timeSlot={selectedTimeSlot}
				providerName={`${selectedProvider?.name}${
					selectedProvider?.license ? `, ${selectedProvider?.license}` : ''
				}`}
				onHide={() => {
					setSelectedAppointmentTypeId(undefined);
					setShowConfirmAppointmentTypeModal(false);
				}}
				onConfirm={(appointmentTypeId) => {
					const confirmedApptType = appointmentTypes.find((aT) => appointmentTypeId === aT.appointmentTypeId);

					if (confirmedApptType && confirmedApptType.visitTypeId === 'FOLLOWUP') {
						if (
							!window.confirm(
								'Do you understand that this appointment is reserved for individuals that have met with this provider before?'
							)
						) {
							return;
						}
					}

					setSelectedAppointmentTypeId(appointmentTypeId);
					setShowConfirmAppointmentTypeModal(false);
					continueBookingProcess({
						provider: selectedProvider,
						requireAssessment: !!confirmedApptType?.assessmentId,
					});
				}}
			/>

			<ConfirmIntakeAssessmentModal
				show={showConfirmIntakeAssessmentModal}
				onHide={() => {
					setShowConfirmIntakeAssessmentModal(false);
				}}
				onConfirm={() => {
					if (!selectedProvider) {
						return;
					}

					navigateToIntakeAssessment(selectedProvider);
				}}
			/>

			<ConfirmProviderBookingModal
				show={showConfirmationModal}
				formattedDate={formattedModalDate}
				provider={selectedProvider}
				selectedTimeSlot={selectedTimeSlot}
				timeSlotEndTime={timeSlotEndTime}
				onHide={() => {
					setShowConfirmationModal(false);
				}}
				onConfirm={async () => {
					if (isBooking || !selectedProvider || !selectedTimeSlot) {
						return;
					}

					try {
						setIsBooking(true);
						const appointmentData: CreateAppointmentData = {
							providerId: selectedProvider.providerId,
							appointmentTypeId: selectedAppointmentTypeId,
							date: formattedAvailabilityDate,
							time: selectedTimeSlot.time,
						};

						if (promptForEmail) {
							appointmentData.emailAddress = collectedEmail;
						}

						if (promptForPhoneNumber) {
							appointmentData.phoneNumber = collectedPhoneNumebr;
						}

						const response = await appointmentService.createAppointment(appointmentData).fetch();

						// Update slot status in UI 🤮
						setAvailableSections(
							availableSections.map((aS) => {
								if (aS.date === selectedDate) {
									const updatedProviders = aS.providers.map((p) => {
										if (p.providerId === selectedProvider.providerId) {
											const updatedTimes = p.times.map((time) => {
												if (time.time === selectedTimeSlot.time) {
													return {
														...time,
														status: 'BOOKED',
													};
												}

												return time;
											});

											return {
												...p,
												times: updatedTimes,
												fullyBooked: updatedTimes.every((t) => t.status === 'BOOKED'),
											};
										}

										return p;
									});

									return {
										...aS,
										providers: updatedProviders,
										fullyBooked: updatedProviders.every((uP) => uP.fullyBooked),
									};
								}

								return aS;
							})
						);

						setShowConfirmationModal(false);

						setSelectedDate(undefined);
						setSelectedProvider(undefined);
						setSelectedTimeSlot(undefined);

						history.replace(`/my-calendar?appointmentId=${response.appointment.appointmentId}`, {
							successBooking: true,
							emailAddress: response.account.emailAddress,
						});
					} catch (e) {
						if ((e as any).metadata?.accountPhoneNumberRequired) {
							setPromptForPhoneNumber(true);
							setShowConfirmationModal(false);
							setShowCollectInfoModal(true);
						} else {
							handleError(e);
						}
					}

					setIsBooking(false);
				}}
			/>
		</>
	);
});
