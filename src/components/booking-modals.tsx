import { BookingContext, BookingSource } from '@/contexts/booking-context';
import useAccount from '@/hooks/use-account';
import { AppointmentType, AvailabilityTimeSlot, Provider } from '@/lib/models';
import React, { useCallback, useContext, useState, useImperativeHandle, forwardRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmAppointmentTypeModal from './confirm-appointment-type-modal';
import ConfirmIntakeAssessmentModal from './confirm-intake-assessment-modal';

export type KickoffBookingOptions = {
	source: BookingSource;
	provider: Provider;
	date: string;
	timeSlot: AvailabilityTimeSlot;
};

export type ContinueBookingOptions = {
	provider?: Provider;
	appointmentType?: AppointmentType;
	timeSlot?: AvailabilityTimeSlot;
	date?: string;
};

export type BookingRefHandle = {
	kickoffBookingProcess: (options: KickoffBookingOptions) => void;
	continueBookingProcess: (options: ContinueBookingOptions) => void;
};

interface HistoryLocationState {
	skipAssessment?: boolean;
	successBooking?: boolean;
	emailAddress?: string;
}

export const BookingModals = forwardRef<BookingRefHandle>((props, ref) => {
	const { account } = useAccount();
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();

	const [showConfirmAppointmentTypeModal, setShowConfirmAppointmentTypeModal] = useState(false);
	const [showConfirmIntakeAssessmentModal, setShowConfirmIntakeAssessmentModal] = useState(false);

	const {
		appointmentTypes,
		epicDepartments,
		setSelectedAppointmentTypeId,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,

		bookingSource,
		setBookingSource,
		setPreservedFilterQueryString,
	} = useContext(BookingContext);

	const currentSearchString = searchParams.toString();
	const skipAssessment = !!(location.state as HistoryLocationState)?.skipAssessment;
	const navigateToEhrLookup = useCallback(() => {
		if (bookingSource === BookingSource.ProviderSearch) {
			setPreservedFilterQueryString(currentSearchString);
		}

		navigate(`/ehr-lookup`, {
			state: {
				skipAssessment,
			},
		});
	}, [bookingSource, currentSearchString, navigate, setPreservedFilterQueryString, skipAssessment]);

	const navigateToIntakeAssessment = useCallback(
		(provider: Provider) => {
			if (!provider) {
				return;
			}

			if (bookingSource === BookingSource.ProviderSearch) {
				setPreservedFilterQueryString(currentSearchString);
			}

			navigate(`/intake-assessment?providerId=${provider.providerId}`, {
				state: {
					skipAssessment,
				},
			});
		},
		[bookingSource, currentSearchString, navigate, setPreservedFilterQueryString, skipAssessment]
	);

	const continueBookingProcess = useCallback(
		({ provider, appointmentType, timeSlot, date }: ContinueBookingOptions) => {
			if (provider?.schedulingSystemId === 'EPIC' && !account?.epicPatientId) {
				navigateToEhrLookup();
			} else if (provider?.intakeAssessmentRequired && provider?.skipIntakePrompt) {
				navigateToIntakeAssessment(provider);
			} else if (provider?.intakeAssessmentRequired || !!appointmentType?.assessmentId) {
				setShowConfirmIntakeAssessmentModal(true);
			} else {
				const params = new URLSearchParams();
				if (provider?.phoneNumberRequiredForAppointment) {
					params.set('promptForPhoneNumber', 'true');
				}

				if (provider?.providerId) {
					params.set('providerId', provider?.providerId);
				}

				if (appointmentType?.appointmentTypeId) {
					params.set('appointmentTypeId', appointmentType?.appointmentTypeId);
				}

				if (date) {
					params.set('date', date);
				}

				if (timeSlot?.time) {
					params.set('time', timeSlot?.time);
				}

				if (appointmentType?.assessmentId) {
					params.set('intakeAssessmentId', appointmentType?.assessmentId);
				}

				navigate(`/confirm-appointment?${params.toString()}`);
			}
		},
		[account?.epicPatientId, navigate, navigateToEhrLookup, navigateToIntakeAssessment]
	);

	const kickoffBookingProcess = useCallback(
		({ source, provider, date, timeSlot }: KickoffBookingOptions) => {
			setBookingSource(source);
			setSelectedProvider(provider);
			setSelectedDate(date);
			setSelectedTimeSlot(timeSlot);

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
					appointmentType: confirmedApptType,
					timeSlot,
				});
			} else {
				setShowConfirmAppointmentTypeModal(true);
			}
		},
		[
			appointmentTypes,
			continueBookingProcess,
			setBookingSource,
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

	return (
		<>
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
						appointmentType: confirmedApptType,
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
		</>
	);
});
