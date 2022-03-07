import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { AppointmentType, LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { AppointmentTypeItem } from './appointment-type-item';

interface SelectedAvailabilityPanelProps {
	logicalAvailabilityId?: string;
	onClose: () => void;
	onEditAvailability: () => void;
	onEditTimeBlock: () => void;
}

export const SelectedAvailabilityPanel = ({
	logicalAvailabilityId,
	onClose,
	onEditAvailability,
	onEditTimeBlock,
}: SelectedAvailabilityPanelProps) => {
	const handleError = useHandleError();
	const { account } = useAccount();
	const [logicalAvailability, setLogicalAvailability] = useState<LogicalAvailability>();

	const [appointmentTypes, setAppointmentTypes] = useState<(AppointmentType | SchedulingAppointmentType)[]>([]);
	const [isBlockedSlot, setIsBlockedSlot] = useState<boolean>(false);

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
				setIsBlockedSlot(availabilityResponse.logicalAvailability.logicalAvailabilityTypeId === 'BLOCK');

				if (availabilityResponse.logicalAvailability.appointmentTypes.length === 0) {
					setAppointmentTypes(appointmentTypesResponse.appointmentTypes);
				} else {
					setAppointmentTypes(availabilityResponse.logicalAvailability.appointmentTypes);
				}
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			availabilityRequest.abort();
			appointmentTypesRequest.abort();
		};
	}, [handleError, logicalAvailabilityId, providerId]);

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>{isBlockedSlot ? 'Blocked Time' : 'Open Availability'}</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
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

					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={isBlockedSlot ? onEditTimeBlock : onEditAvailability}
					>
						edit
					</Button>
				</div>

				{!isBlockedSlot &&
					appointmentTypes.map((aT) => {
						return (
							<AppointmentTypeItem key={aT.appointmentTypeId} color={aT.hexColor} nickname={aT.name} />
						);
					})}
			</div>
		</div>
	);
};
