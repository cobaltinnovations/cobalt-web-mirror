import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { AppointmentType, LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { AppointmentTypeItem } from './appointment-type-item';

interface SelectedAvailabilityPanelProps {
	onClose: () => void;
}

export const SelectedAvailabilityPanel = ({ onClose }: SelectedAvailabilityPanelProps) => {
	const { logicalAvailabilityId } = useParams<{ logicalAvailabilityId: string }>();
	const handleError = useHandleError();
	const { account } = useAccount();
	const [logicalAvailability, setLogicalAvailability] = useState<LogicalAvailability>();

	const [appointmentTypes, setAppointmentTypes] = useState<(AppointmentType | SchedulingAppointmentType)[]>([]);
	const [isBlockedTime, setIsBlockedTime] = useState<boolean | null>(null);
	const [closePanel, setClosePanel] = useState<boolean>(false);

	const providerId = account?.providerId;

	useEffect(() => {
		if (!logicalAvailabilityId || !providerId) {
			return;
		}

		const availabilityRequest = schedulingService.getLogicalAvailability(logicalAvailabilityId);
		const appointmentTypesRequest = schedulingService.getAppointmentTypes(providerId);

		Promise.all([availabilityRequest.fetch(), appointmentTypesRequest.fetch()])
			.then(([availabilityResponse, appointmentTypesResponse]) => {
				setLogicalAvailability(availabilityResponse.logicalAvailability);
				setIsBlockedTime(availabilityResponse.logicalAvailability.logicalAvailabilityTypeId === 'BLOCK');

				if (availabilityResponse.logicalAvailability.appointmentTypes.length === 0) {
					setAppointmentTypes(appointmentTypesResponse.appointmentTypes);
				} else {
					setAppointmentTypes(availabilityResponse.logicalAvailability.appointmentTypes);
				}
			})
			.catch((e) => {
				if (e.code === 'NOT_FOUND') {
					setClosePanel(true);
				} else if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			availabilityRequest.abort();
			appointmentTypesRequest.abort();
		};
	}, [handleError, logicalAvailabilityId, onClose, providerId]);

	useEffect(() => {
		closePanel && onClose();
	}, [closePanel, onClose]);

	return (
		<div>
			<div className="d-flex align-items-center py-4">
				{isBlockedTime !== null && (
					<h4 className="mb-0">{isBlockedTime ? 'Blocked Time' : 'Open Availability'}</h4>
				)}

				<Button
					data-testid="viewAvailabilityCloseButton"
					variant="link"
					size="sm"
					className="ms-auto p-0"
					onClick={() => onClose()}
				>
					<CloseIcon />
				</Button>
			</div>

			<div className="border p-2">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						{logicalAvailability?.descriptionComponents.map((description, index) => {
							return (
								<p className="mb-0" key={index}>
									<strong>{description}</strong>
								</p>
							);
						})}
					</div>

					<Link to={`edit`}>
						<Button data-testid="viewAvailabilityEditButton" variant="link" size="sm" className="p-0">
							<EditIcon />
						</Button>
					</Link>
				</div>

				{!isBlockedTime &&
					appointmentTypes.map((aT) => {
						return <AppointmentTypeItem key={aT.appointmentTypeId} appointmentType={aT} />;
					})}
			</div>
		</div>
	);
};
