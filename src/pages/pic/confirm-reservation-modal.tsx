import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Provider, AvailabilityTimeSlot } from '@/lib/models';
import { useTranslation } from 'react-i18next';

const useConfirmPicReservationModalStyles = createUseStyles({
	confirmProviderBookingModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface ConfirmPicReservationModalProps extends ModalProps {
	onConfirm(): void;
	formattedDate: string;
	provider?: Provider;
	selectedTimeSlot?: AvailabilityTimeSlot;
	timeSlotEndTime?: string;
}

const ConfirmPicReservationModal: FC<ConfirmPicReservationModalProps> = ({
	onConfirm,
	formattedDate,
	provider,
	selectedTimeSlot,
	timeSlotEndTime,
	...props
}) => {
	const { t } = useTranslation();
	const classes = useConfirmPicReservationModalStyles();

	const providerName = provider?.name ?? '';
	const providerLicense = provider?.license ?? '';
	const providerDetails = providerName + (!!providerLicense ? `, ${providerLicense}` : '');

	return (
		<Modal {...props} dialogClassName={classes.confirmProviderBookingModal} centered>
			<Modal.Header>
				<h3 className="mb-0">{t('picConfirmReservationModal.title', 'Confirm your reservation')}</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 font-karla-regular">
					<strong>
						{t('picpicConfirmReservationModal.message', 'Appointment with\r\n{{providerDetails}}\r\n{{date}}\r\n{{fromTime}}\r\n{{toTime}}', {
							providerDetails,
							date: formattedDate,
							fromTime: selectedTimeSlot?.timeDescription,
							toTime: timeSlotEndTime,
						})}
					</strong>
				</p>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					{t('picpicConfirmReservationModal.cancel', 'Cancel')}
				</Button>

				<Button variant="primary" size="sm" onClick={onConfirm}>
					{t('picpicConfirmReservationModal.confirm', 'Confirm')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmPicReservationModal;
