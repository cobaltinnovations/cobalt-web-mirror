import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseStyles } from 'react-jss';
import { AppointmentType, EpicDepartment } from '@/lib/models/appointments';
import fonts from '@/jss/fonts';
import colors from '@/jss/colors';
import { AvailabilityTimeSlot } from '@/lib/models';

const useConfirmAppointmentTypeModalStyles = createUseStyles({
	confirmAppointmentTypeModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
	unavaiableSlot: {
		...fonts.xxs,
		color: colors.gray600,
	},
});

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
			<Modal.Header>
				<h3 className="mb-0">appointment options</h3>
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
							bsPrefix="cobalt-modal-form__check"
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
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={() => {
						onConfirm(selectedId);
					}}
				>
					reserve
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmAppointmentTypeModal;
