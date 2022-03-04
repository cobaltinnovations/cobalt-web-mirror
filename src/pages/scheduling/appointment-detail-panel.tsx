import useHandleError from '@/hooks/use-handle-error';
import { AccountModel, AppointmentModel } from '@/lib/models';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { accountService, appointmentService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import { CopyToClipboardButton } from './copy-to-clipboard-button';
import { useSchedulingStyles } from './use-scheduling-styles';

interface AppointmentDetailPanelProps {
	appointmentId?: string;
	onEdit: () => void;
	onClose: () => void;
	onAddAppointment: () => void;
}

export const AppointmentDetailPanel = ({
	appointmentId,
	onEdit,
	onClose,
	onAddAppointment,
}: AppointmentDetailPanelProps) => {
	const schedulingClasses = useSchedulingStyles();
	const handleError = useHandleError();
	const [patient, setPatient] = useState<AccountModel>();
	const [appointment, setAppointment] = useState<AppointmentModel>();

	useEffect(() => {
		const request = appointmentService.getAppointment(appointmentId);

		request
			.fetch()
			.then((response) => {
				setAppointment(response.appointment);

				return accountService
					.getAppointmentDetailsForAccount(response.appointment.accountId, response.appointment.appointmentId)
					.fetch();
			})
			.then((accountDetailsResponse) => {
				console.log('accountDetailsResponse', accountDetailsResponse);
				setPatient(accountDetailsResponse.account);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [appointmentId, handleError]);

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>
					{patient?.firstName || patient?.lastName
						? `${patient?.firstName} ${patient?.lastName}`
						: 'Anonymous'}
				</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="mb-4">
				<Button as="a" variant="primary" size="sm" className="mr-1" href={appointment?.videoconferenceUrl}>
					join now
				</Button>

				<CopyToClipboardButton className="mr-1" text={appointment?.videoconferenceUrl} />

				<Button variant="primary" size="sm" className="px-2" onClick={onEdit}>
					<EditIcon />
				</Button>
			</div>

			<div className="border p-2 my-2">
				<div className="mb-2 d-flex justify-content-between align-items-center">
					<p className="mb-0">
						<strong>contact information</strong>
					</p>
					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							return;
						}}
					>
						<EditIcon />
					</Button>
				</div>

				<p className="mb-0">
					<strong>phone</strong>
				</p>
				<p>{patient?.phoneNumber || 'Not availabile'}</p>

				<p className="mb-0">
					<strong>email</strong>
				</p>
				<p>{patient?.emailAddress || 'Not availabile'}</p>
			</div>

			<div className="border p-2 my-2">
				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>assessments completed</strong>
					</p>
				</div>

				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>PH-9</strong> Mon 7/28/20
					</p>

					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							alert('TODO: Show assessment results');
						}}
					>
						view
					</Button>
				</div>

				<div className="d-flex mb-1 justify-content-between align-items-center">
					<p className="mb-0">
						<strong>PH-9</strong> Wed 8/5/20
					</p>

					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							alert('TODO: Show assessment results');
						}}
					>
						view
					</Button>
				</div>
			</div>

			<div className="border p-2 my-2">
				<div className="d-flex justify-content-between align-items-center">
					<p className="mb-0">
						<strong>all appointments</strong>
					</p>

					<button
						className={schedulingClasses.roundBtn}
						onClick={() => {
							onAddAppointment();
						}}
					>
						<PlusIcon />
					</button>
				</div>
			</div>
		</div>
	);
};
