import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';

import { schedulingService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { AvailabilityForm, AvailabilityFormSchema } from './availability-form';
import colors from '@/jss/colors';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';

interface EditAvailabilityPanelProps {
	logicalAvailabilityId?: string;
	onClose: () => void;
}

export const EditAvailabilityPanel = ({ logicalAvailabilityId, onClose }: EditAvailabilityPanelProps) => {
	const [initialValues, setInitialValues] = useState<AvailabilityFormSchema>();

	const fetchData = useCallback(async () => {
		// Return instead of throwing error
		// if no logicalAvailabilityId, we are creating a new one
		if (!logicalAvailabilityId) {
			return;
		}

		const { logicalAvailability } = await schedulingService.getLogicalAvailability(logicalAvailabilityId).fetch();
		const startMoment = moment(logicalAvailability.startDateTime, 'YYYY-MM-DDTHH:mm').toISOString();
		const endMoment = moment(logicalAvailability.endDateTime, 'YYYY-MM-DDTHH:mm').toISOString();

		setInitialValues({
			appointmentTypes: logicalAvailability.appointmentTypes.map((at) => at.appointmentTypeId),
			startDate: moment(startMoment).format('MMM DD, yyyy'),
			startTime: moment(startMoment).format('hh:mm'),
			startTimeMeridian: moment(startMoment).format('a'),
			endDate: moment(endMoment).format('MMM DD, yyyy'),
			endTime: moment(endMoment).format('hh:mm'),
			endTimeMeridian: moment(endMoment).format('a'),
			typesAccepted: logicalAvailability.appointmentTypes.length > 0 ? 'limited' : 'all',
			recurring: logicalAvailability.recurrenceTypeId === 'DAILY' ? true : false,
			occurance: {
				S: logicalAvailability.recurSunday,
				M: logicalAvailability.recurMonday,
				T: logicalAvailability.recurTuesday,
				W: logicalAvailability.recurWednesday,
				Th: logicalAvailability.recurThursday,
				F: logicalAvailability.recurFriday,
				Sa: logicalAvailability.recurSaturday,
			},
		});
	}, [logicalAvailabilityId]);

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<Button variant="link" size="sm" className="p-0" onClick={onClose}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>
				<Button variant="link" size="sm" className="p-0" onClick={onClose}>
					<CloseIcon />
				</Button>
			</div>

			<AsyncPage fetchData={fetchData} showBackButton={false} showRetryButton={false}>
				<div className="d-flex align-items-center justify-content-between py-4">
					<h5 className="m-0">Edit availability</h5>
					<Button variant="link" size="sm" className="text-danger p-0" onClick={onClose}>
						delete
					</Button>
				</div>

				<AvailabilityForm
					logicalAvailabilityTypeId="OPEN"
					initialValues={initialValues}
					onBack={onClose}
					onSuccess={onClose}
				/>
			</AsyncPage>
		</div>
	);
};
