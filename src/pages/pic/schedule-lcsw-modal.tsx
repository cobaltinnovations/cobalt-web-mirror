import classNames from 'classnames';
import moment from 'moment';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';

import AvailableProvider from '@/components/available-provider';
import ConfirmAppointmentTypeModal from '@/components/confirm-appointment-type-modal';
import DatePicker from '@/components/date-picker';
import Loader from '@/components/loader';

import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { AvailabilityTimeSlot, Provider } from '@/lib/models';
import { appointmentService, FindProvidersResponse, providerService } from '@/lib/services';

const useStyles = createUseStyles({
	providersWrapper: {
		minHeight: 380,
		height: 380,
		overflow: 'scroll',
	},
});

interface PicScheduleLCSWModalProps extends ModalProps {
	patientAccountId: string;
	patientName: string;
	onSuccess: () => void;
}

export const PicScheduleLCSWModal: FC<PicScheduleLCSWModalProps> = (props) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { t } = useTranslation();

	const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment().add(1, 'day'));
	const [isBooking, setIsBooking] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showConfirmAppointmentTypeModal, setShowConfirmAppointmentTypeModal] = useState(false);
	const [appointmentTypes, setAppointmentTypes] = useState<FindProvidersResponse['appointmentTypes']>([]);
	const [section, setSection] = useState<FindProvidersResponse['sections'][0]>();
	const [selectedProvider, setSelectedProvider] = useState<Provider>();
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailabilityTimeSlot>();

	const findAvailableLCSWs = useCallback(() => {
		const date = selectedDate.format('YYYY-MM-DD');

		const request = providerService.findProviders({
			startDate: date,
			endDate: date,
			licenseTypes: ['LCSW'],
		});

		setIsLoading(true);

		request
			.fetch()
			.then((response) => {
				setIsLoading(false);
				setAppointmentTypes(response.appointmentTypes);
				setSection(response.sections[0]);
			})
			.catch((e) => {
				if (e !== ERROR_CODES.REQUEST_ABORTED) {
					setIsLoading(false);
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [handleError, selectedDate]);

	const createAppointment = useCallback(
		(appointmentTypeId: string) => {
			if (!selectedProvider || !selectedTimeSlot || isBooking) {
				return;
			}

			setIsBooking(true);

			const request = appointmentService.createAppointment({
				accountId: props.patientAccountId,
				providerId: selectedProvider.providerId,
				time: selectedTimeSlot.time,
				date: selectedDate.format('YYYY-MM-DD'),
				appointmentTypeId,
			});

			request
				.fetch()
				.then(() => {
					setIsBooking(false);
					props.onSuccess();
				})
				.catch((e) => {
					if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
						setIsBooking(false);
						handleError(e);
					}
				});

			return () => {
				request.abort();
			};
		},
		[handleError, isBooking, props, selectedDate, selectedProvider, selectedTimeSlot]
	);

	useEffect(() => {
		if (!props.show) {
			setAppointmentTypes([]);
			setSection(undefined);
			setSelectedProvider(undefined);
			setSelectedTimeSlot(undefined);
			return;
		}

		findAvailableLCSWs();
	}, [findAvailableLCSWs, props.show]);

	return (
		<>
			<ConfirmAppointmentTypeModal
				show={showConfirmAppointmentTypeModal}
				appointmentTypes={appointmentTypes
					.filter((aT) => selectedProvider?.appointmentTypeIds.includes(aT.appointmentTypeId))
					.map((aT) => ({
						...aT,
						disabled: !selectedTimeSlot?.appointmentTypeIds.includes(aT.appointmentTypeId),
					}))}
				timeSlot={selectedTimeSlot}
				providerName={`${selectedProvider?.name}${selectedProvider?.license ? `, ${selectedProvider?.license}` : ''}`}
				onHide={() => {
					setShowConfirmAppointmentTypeModal(false);
				}}
				onConfirm={(appointmentTypeId) => {
					setShowConfirmAppointmentTypeModal(false);
					createAppointment(appointmentTypeId);
				}}
			/>

			<Modal size="lg" centered show={props.show} onHide={props.onHide}>
				<Modal.Header closeButton className="border-bottom bg-light">
					<h4>{t('pic.scheduleLCSWModal.title', 'schedule appointment with LCSW')}</h4>
					<p>{t('pic.scheduleLCSWModal.subtitle', 'Patient: {{patientName}}', { patientName: props.patientName })}</p>
				</Modal.Header>

				<Modal.Body>
					<DatePicker
						showYearDropdown
						showMonthDropdown
						dropdownMode="select"
						selected={selectedDate.toDate()}
						onChange={(date) => {
							setSelectedDate(moment(date));
						}}
					/>

					<div className={classNames('border mt-2', classes.providersWrapper)}>
						{isLoading ? (
							<Loader />
						) : !!section ? (
							section?.fullyBooked ? (
								<p className="text-center m-4">
									<strong>{t('pic.scheduleLCSWModal.allBooked', 'all appointments are booked for this date')}</strong>
								</p>
							) : (
								section.providers.map((provider) => {
									return (
										<AvailableProvider
											key={provider.providerId}
											selectedTimeSlot={selectedTimeSlot}
											className="m-4"
											provider={provider}
											onTimeSlotClick={(timeSlot) => {
												const isSelected = selectedTimeSlot === timeSlot;

												setSelectedProvider(provider);
												setSelectedTimeSlot(isSelected ? undefined : timeSlot);
											}}
										/>
									);
								})
							)
						) : (
							<p className="text-center m-4">
								<strong>{t('pic.scheduleLCSWModal.noAvailabilities', 'No appointments are available.')}</strong>
							</p>
						)}
					</div>
				</Modal.Body>

				<Modal.Footer className="border-top bg-light pt-4 d-flex justify-content-end">
					<Button
						size="sm"
						variant="outline-primary"
						className="mr-2"
						onClick={() => {
							props.onHide();
						}}
					>
						{t('pic.scheduleLCSWModal.actions.cancel', 'cancel')}
					</Button>

					<Button
						size="sm"
						variant="primary"
						disabled={!selectedTimeSlot}
						onClick={() => {
							if (!selectedProvider) {
								return;
							}

							if (selectedProvider.appointmentTypeIds.length > 1) {
								setShowConfirmAppointmentTypeModal(true);
								return;
							}

							createAppointment(selectedProvider.appointmentTypeIds[0]);
						}}
					>
						{t('pic.scheduleLCSWModal.actions.save', 'save')}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default PicScheduleLCSWModal;
