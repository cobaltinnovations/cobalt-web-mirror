import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import InlineAlert from '@/components/inline-alert';
import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import {
	AppointmentModel,
	AppointmentTimeStatusId,
	ATTENDANCE_STATUS_ID,
	CareEncounterAttendanceStatusModel,
} from '@/lib/models';
import { careEncounterService } from '@/lib/services';

const useStyles = createUseThemedStyles((theme) => ({
	appointmentRow: {
		gap: 24,
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	appointment: {
		gap: 16,
		display: 'flex',
		alignItems: 'center',
	},
	calendarIcon: {
		width: 36,
		height: 36,
		display: 'flex',
		flexShrink: 0,
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.p500,
		backgroundColor: theme.colors.p50,
	},
	actions: {
		gap: 16,
		display: 'flex',
		alignItems: 'center',
	},
	joinButton: {
		color: `${theme.colors.n0} !important`,
		textDecoration: 'none !important',
		'&:hover, &:focus, &:active': {
			color: `${theme.colors.n0} !important`,
			textDecoration: 'none !important',
		},
	},
}));

interface Props {
	appointment: AppointmentModel;
	onCancel(): void;
	onAttendanceStatusChange(attendanceStatusId: ATTENDANCE_STATUS_ID): Promise<void>;
}

export const EncounterAppointmentCard = ({ appointment, onCancel, onAttendanceStatusChange }: Props) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [attendanceStatuses, setAttendanceStatuses] = useState<CareEncounterAttendanceStatusModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const attendanceStatusesRequestRef =
		useRef<ReturnType<typeof careEncounterService.getCareEncounterAttendanceStatuses>>();
	const attendanceEnabled =
		appointment.appointmentTimeStatusId === AppointmentTimeStatusId.IN_SESSION ||
		appointment.appointmentTimeStatusId === AppointmentTimeStatusId.PASSED;

	useEffect(() => {
		if (!attendanceEnabled || appointment.canceled) {
			setAttendanceStatuses([]);
			setIsLoading(false);
			return;
		}

		const request = careEncounterService.getCareEncounterAttendanceStatuses();
		attendanceStatusesRequestRef.current = request;
		setIsLoading(true);

		request
			.fetch()
			.then((response) => {
				if (request === attendanceStatusesRequestRef.current) {
					setAttendanceStatuses(response.attendanceStatuses);
				}
			})
			.catch((error) => {
				if (request === attendanceStatusesRequestRef.current) {
					handleError(error);
				}
			})
			.finally(() => {
				if (request === attendanceStatusesRequestRef.current) {
					attendanceStatusesRequestRef.current = undefined;
					setIsLoading(false);
				}
			});

		return () => {
			if (request === attendanceStatusesRequestRef.current) {
				attendanceStatusesRequestRef.current = undefined;
				request.abort();
			}
		};
	}, [appointment.appointmentId, appointment.canceled, attendanceEnabled, handleError]);

	const handleAttendanceStatusChange = useCallback(
		async (attendanceStatusId: ATTENDANCE_STATUS_ID) => {
			if (!attendanceStatusId) {
				return;
			}

			setIsLoading(true);

			try {
				await onAttendanceStatusChange(attendanceStatusId);
			} finally {
				setIsLoading(false);
			}
		},
		[onAttendanceStatusChange]
	);

	if (appointment.canceled) {
		return <NoData title="No Active Appointment" actions={[]} />;
	}

	return (
		<Card bsPrefix="ic-card">
			<Card.Header>
				<Card.Title>Appointment</Card.Title>
			</Card.Header>
			<Card.Body>
				{appointment.appointmentTimeStatusId === AppointmentTimeStatusId.IN_SESSION && (
					<InlineAlert className="mb-6" variant="primary" title="Appointment in session" />
				)}

				<div className={classes.appointmentRow}>
					<div className={classes.appointment}>
						<div className={classes.calendarIcon}>
							<SvgIcon kit="far" icon="calendar" size={16} className="d-flex" />
						</div>
						<h5 className="mb-0 text-uppercase">{appointment.startTimeDescription}</h5>
					</div>

					<div className={classes.actions}>
						<Button
							as="a"
							className={classes.joinButton}
							href={appointment.videoconferenceUrl}
							target="_blank"
							rel="noopener noreferrer"
							variant="primary"
						>
							Join Video Call
						</Button>

						<Dropdown>
							<Dropdown.Toggle
								as={DropdownToggle}
								id={`encounter-appointment-actions--${appointment.appointmentId}`}
								variant="outline-primary"
								className="d-flex align-items-center"
								disabled={attendanceEnabled}
							>
								Edit
								<SvgIcon kit="far" icon="chevron-down" size={16} className="ms-2" />
							</Dropdown.Toggle>
							<Dropdown.Menu compact as={DropdownMenu} align="end" renderOnMount>
								<Dropdown.Item className="d-flex align-items-center text-danger" onClick={onCancel}>
									<SvgIcon kit="far" icon="calendar-xmark" size={16} className="me-2" />
									Cancel
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</div>

				{attendanceEnabled && (
					<InputHelper
						className="mt-6"
						as="select"
						label="Did the patient attend the appointment?"
						value={
							appointment.attendanceStatusId === ATTENDANCE_STATUS_ID.UNKNOWN
								? ''
								: appointment.attendanceStatusId
						}
						disabled={isLoading || attendanceStatuses.length === 0}
						required
						onChange={({ currentTarget }) => {
							handleAttendanceStatusChange(currentTarget.value as ATTENDANCE_STATUS_ID);
						}}
					>
						<option value="" label="Select..." disabled />
						{attendanceStatuses.map((attendanceStatus) => (
							<option
								key={attendanceStatus.attendanceStatusId}
								value={attendanceStatus.attendanceStatusId}
							>
								{attendanceStatus.description}
							</option>
						))}
					</InputHelper>
				)}
			</Card.Body>
		</Card>
	);
};
