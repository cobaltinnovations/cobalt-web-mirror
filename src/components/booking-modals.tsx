import { BookingContext, BookingSource } from '@/contexts/booking-context';
import useAccount from '@/hooks/use-account';
import { AppointmentType, AvailabilityTimeSlot, Provider } from '@/lib/models';
import moment from 'moment';
import React, { useCallback, useContext, useState, useImperativeHandle, forwardRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmAppointmentTypeModal from './confirm-appointment-type-modal';
import ConfirmIntakeAssessmentModal from './confirm-intake-assessment-modal';
import Cookies from 'js-cookie';

export type KickoffBookingOptions = {
	source: BookingSource;
	exitUrl: string;
	provider: Provider;
	date: string;
	timeSlot: AvailabilityTimeSlot;
	patientOrderId?: string;
};

export type ContinueBookingOptions = {
	provider?: Provider;
	appointmentType?: AppointmentType;
	timeSlot?: AvailabilityTimeSlot;
	date?: string;
	patientOrderId?: string;
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
		selectedDate,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,
		selectedPatientOrderId,
		setSelectedPatientOrderId,

		setPreservedFilterQueryString,
	} = useContext(BookingContext);

	const currentSearchString = searchParams.toString();
	const skipAssessment = !!(location.state as HistoryLocationState)?.skipAssessment;
	const navigateToEhrLookup = useCallback(() => {
		const bookingSource = Cookies.get('bookingSource');

		if (bookingSource === BookingSource.ProviderSearch) {
			setPreservedFilterQueryString(currentSearchString);
		}

		navigate(`/ehr-lookup`, {
			state: {
				skipAssessment,
			},
		});
	}, [currentSearchString, navigate, setPreservedFilterQueryString, skipAssessment]);

	const navigateToIntakeAssessment = useCallback(
		(provider: Provider) => {
			if (!provider) {
				return;
			}

			const bookingSource = Cookies.get('bookingSource');

			if (bookingSource === BookingSource.ProviderSearch) {
				setPreservedFilterQueryString(currentSearchString);
			}

			navigate(`/intake-assessment?providerId=${provider.providerId}`, {
				state: {
					skipAssessment,
				},
			});
		},
		[currentSearchString, navigate, setPreservedFilterQueryString, skipAssessment]
	);

	const continueBookingProcess = useCallback(
		({ provider, appointmentType, timeSlot, date, patientOrderId }: ContinueBookingOptions) => {
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
					params.set('date', moment(date).format('YYYY-MM-DD'));
				}

				if (timeSlot?.time) {
					params.set('time', timeSlot.time);
				}

				if (timeSlot?.epicAppointmentFhirId) {
					params.set('epicAppointmentFhirId', timeSlot.epicAppointmentFhirId);
				}

				if (appointmentType?.assessmentId) {
					params.set('intakeAssessmentId', appointmentType?.assessmentId);
				}

				if (patientOrderId) {
					params.set('patientOrderId', patientOrderId);
				}

				navigate(`/confirm-appointment?${params.toString()}`);
			}
		},
		[account?.epicPatientId, navigate, navigateToEhrLookup, navigateToIntakeAssessment]
	);

	const kickoffBookingProcess = useCallback(
		({ source, exitUrl, provider, date, timeSlot, patientOrderId }: KickoffBookingOptions) => {
			Cookies.set('bookingSource', source);
			Cookies.set('bookingExitUrl', exitUrl);

			setSelectedProvider(provider);
			setSelectedDate(date);
			setSelectedTimeSlot(timeSlot);
			setSelectedPatientOrderId(patientOrderId);

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
					date,
					patientOrderId,
				});
			} else {
				setShowConfirmAppointmentTypeModal(true);
			}
		},
		[
			appointmentTypes,
			continueBookingProcess,
			setSelectedAppointmentTypeId,
			setSelectedDate,
			setSelectedPatientOrderId,
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
						timeSlot: selectedTimeSlot,
						date: selectedDate,
						patientOrderId: selectedPatientOrderId,
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
