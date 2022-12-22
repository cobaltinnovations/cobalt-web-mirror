import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { AppointmentModel } from '@/lib/models';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { appointmentService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CopyToClipboardButton } from './copy-to-clipboard-button';
import { AppointmentForm } from './appointment-form';
import { useScrollCalendar } from './use-scroll-calendar';
import { format, formatISO, parseISO } from 'date-fns';

interface EditAppointmentPanelProps {
	setCalendarDate: (date: Date, time?: string) => void;
	onClose: (updatedAppointmentId?: string) => void;
	focusDateOnLoad: boolean;
}

export const EditAppointmentPanel = ({ setCalendarDate, onClose, focusDateOnLoad }: EditAppointmentPanelProps) => {
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { account } = useAccount();
	const relativeUrl = `/providers/${account?.providerId}?&immediateAccess=true`;
	const fullUrl = `${window.location.protocol}//${window.location.host}${relativeUrl}`;

	const [appointment, setAppointment] = useState<AppointmentModel>();

	const isCreate = location.pathname.endsWith('new-appointment');

	const initialValues = useMemo(() => {
		const appointmentDate = appointment?.startTime && parseISO(appointment?.startTime);

		return {
			date: appointmentDate ? formatISO(appointmentDate, { representation: 'date' }) : '',
			startTime: appointmentDate ? format(appointmentDate, 'hh:mm') : '',
			startTimeMeridian: appointmentDate ? format(appointmentDate, 'aaa') : '',
			appointmentTypeId: appointment?.appointmentTypeId ?? '',
		};
	}, [appointment?.appointmentTypeId, appointment?.startTime]);

	useScrollCalendar(setCalendarDate, focusDateOnLoad, appointment);

	useEffect(() => {
		if (!appointmentId || isCreate) {
			return;
		}

		const request = appointmentService.getAppointment(appointmentId);

		request
			.fetch()
			.then((response) => {
				setAppointment(response.appointment);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [appointmentId, handleError, isCreate]);

	useEffect(() => {
		if (appointment?.canceledForReschedule && appointment?.rescheduledAppointmentId) {
			navigate(`/scheduling/appointments/${appointment?.rescheduledAppointmentId}/edit`);
		}
	}, [appointment?.canceledForReschedule, appointment?.rescheduledAppointmentId, navigate]);

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>{isCreate ? 'New' : 'Edit'} appointment</h4>

				<Button
					variant="link"
					size="sm"
					className="p-0"
					onClick={() => {
						onClose(appointmentId);
					}}
				>
					<CloseIcon />
				</Button>
			</div>

			{isCreate ? (
				<>
					<p>Patients can use this URL to book with you:</p>

					<div className="border d-flex align-items-center p-2">
						<Link to={relativeUrl} target="_blank">
							{fullUrl}
						</Link>

						<CopyToClipboardButton className="ms-2" text={fullUrl} />
					</div>
				</>
			) : (
				<AppointmentForm
					appointmentId={appointmentId}
					initialValues={initialValues}
					onBack={() => {
						if (!appointmentId) {
							return;
						}
						onClose(appointmentId);
					}}
					onSuccess={(newAppointmentId) => {
						if (!newAppointmentId || !appointmentId) {
							return;
						}

						onClose(newAppointmentId || appointmentId);
					}}
				/>
			)}
		</div>
	);
};
