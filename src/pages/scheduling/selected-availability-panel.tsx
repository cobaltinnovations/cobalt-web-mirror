import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { AppointmentType, LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { AppointmentTypeItem } from './appointment-type-item';
import SvgIcon from '@/components/svg-icon';

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
				} else {
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
					<SvgIcon kit="far" icon="xmark" size={16} />
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
							<SvgIcon kit="far" icon="pen" size={16} />
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
