import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { AppointmentModel } from '@/lib/models';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { appointmentService } from '@/lib/services';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CopyToClipboardButton } from './copy-to-clipboard-button';
import { AppointmentForm } from './appointment-form';
import { useScrollCalendar } from './use-scroll-calendar';
import SvgIcon from '@/components/svg-icon';

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
	const relativeUrl = `/providers/${account?.providerId}`;
	const fullUrl = `${window.location.protocol}//${window.location.host}${relativeUrl}`;

	const [appointment, setAppointment] = useState<AppointmentModel>();

	const isCreate = location.pathname.endsWith('new-appointment');

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
				handleError(e);
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
					<SvgIcon kit="far" icon="xmark" size={16} />
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
