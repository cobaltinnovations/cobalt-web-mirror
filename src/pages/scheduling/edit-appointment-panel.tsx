import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { AppointmentModel } from '@/lib/models';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { appointmentService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import { Link, Redirect, useParams, useRouteMatch } from 'react-router-dom';
import { CopyToClipboardButton } from './copy-to-clipboard-button';
import { AppointmentForm } from './appointment-form';
import { useScrollCalendar } from './use-scroll-calendar';

interface EditAppointmentPanelProps {
	setCalendarDate: (date: Date, time?: string) => void;
	onClose: (updatedAppointmentId: string) => void;
	focusDateOnLoad: boolean;
}

export const EditAppointmentPanel = ({ setCalendarDate, onClose, focusDateOnLoad }: EditAppointmentPanelProps) => {
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const routeMatch = useRouteMatch();
	const handleError = useHandleError();
	const { account } = useAccount();
	const relativeUrl = `/providers/${account?.providerId}?&immediateAccess=true`;
	const fullUrl = `${window.location.protocol}//${window.location.host}${relativeUrl}`;

	const [appointment, setAppointment] = useState<AppointmentModel>();

	const isCreate = routeMatch.path.endsWith('new-appointment');

	const initialValues = useMemo(() => {
		const appointmentMoment = appointment?.startTime ? moment(appointment?.startTime) : null;

		return {
			date: appointmentMoment?.format('YYYY-MM-DD') ?? '',
			startTime: appointmentMoment?.format('hh:mm') ?? '',
			startTimeMeridian: appointmentMoment?.format('a') ?? '',
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

	if (appointment?.canceledForReschedule && appointment?.rescheduledAppointmentId) {
		return <Redirect to={`/scheduling/appointments/${appointment?.rescheduledAppointmentId}/edit`} />;
	}

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>{isCreate ? 'New' : 'Edit'} appointment</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose(appointmentId)}>
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
						onClose(appointmentId);
					}}
					onSuccess={(newAppointmentId) => {
						onClose(newAppointmentId || appointmentId);
					}}
				/>
			)}
		</div>
	);
};
