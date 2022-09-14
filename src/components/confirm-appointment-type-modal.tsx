import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import classNames from 'classnames';

import { AppointmentType, EpicDepartment } from '@/lib/models/appointments';
import { AvailabilityTimeSlot } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useConfirmAppointmentTypeModalStyles = createUseThemedStyles((theme) => ({
	confirmAppointmentTypeModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
	unavaiableSlot: {
		...theme.fonts.small,
		color: theme.colors.n500,
	},
}));

interface ConfirmAppointmentTypeModalProps extends ModalProps {
	appointmentTypes: (AppointmentType & { disabled: boolean })[];
	providerName: string;
	onConfirm(appointmentTypeId: string): void;
	epicDepartment?: EpicDepartment;
	timeSlot?: AvailabilityTimeSlot;
}

const ConfirmAppointmentTypeModal: FC<ConfirmAppointmentTypeModalProps> = ({
	appointmentTypes,
	providerName,
	onConfirm,
	timeSlot,
	epicDepartment,
	...props
}) => {
	useTrackModalView('ConfirmAppointmentTypeModal', props.show);
	const classes = useConfirmAppointmentTypeModalStyles();

	const [selectedId, setSelectedId] = useState('');

	useEffect(() => {
		if (!Array.isArray(appointmentTypes) || !appointmentTypes.length) {
			return;
		}

		const initialVal = appointmentTypes.find((aT) => !aT.disabled);
		setSelectedId(initialVal?.appointmentTypeId ?? '');
	}, [appointmentTypes]);

	return (
		<Modal {...props} dialogClassName={classes.confirmAppointmentTypeModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Appointment Options</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<p className="mb-2">
					Choose the type of appointment you would like to make with <b>{providerName}</b>
					{epicDepartment && (
						<>
							{' '}
							(<b>{epicDepartment.name}</b>)
						</>
					)}
				</p>

				{appointmentTypes.map((apptType) => {
					return (
						<Form.Check
							key={apptType.appointmentTypeId}
							type="radio"
							disabled={apptType.disabled}
							id={apptType.appointmentTypeId}
							name={apptType.appointmentTypeId}
							label={
								<>
									{apptType.name} - {apptType.durationInMinutesDescription}
									{apptType.disabled && (
										<p className={classNames('mb-0', classes.unavaiableSlot)}>
											(unavailable at {timeSlot?.timeDescription})
										</p>
									)}
								</>
							}
							checked={apptType.appointmentTypeId === selectedId}
							onChange={() => {
								setSelectedId(apptType.appointmentTypeId);
							}}
						/>
					);
				})}
			</Modal.Body>

			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							onConfirm(selectedId);
						}}
					>
						Reserve
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmAppointmentTypeModal;
