import React, { useCallback } from 'react';
import { Button } from 'react-bootstrap';

import { schedulingService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { AvailabilityForm } from './availability-form';
import colors from '@/jss/colors';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';

interface EditUnavailableTimeBlockPanelProps {
	logicalAvailabilityId?: string;
	onClose: () => void;
}

export const EditUnavailableTimeBlockPanel = ({
	logicalAvailabilityId,
	onClose,
}: EditUnavailableTimeBlockPanelProps) => {
	const fetchData = useCallback(async () => {
		// Return instead of throwing error
		// if no logicalAvailabilityId, we are creating a new one
		if (!logicalAvailabilityId) {
			return;
		}

		const response = await schedulingService.getLogicalAvailability(logicalAvailabilityId).fetch();
		console.log(response);
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
					<h5 className="m-0">Edit unavailable time block</h5>
					<Button variant="link" size="sm" className="text-danger p-0" onClick={onClose}>
						delete
					</Button>
				</div>

				<AvailabilityForm logicalAvailabilityTypeId="BLOCK" onBack={onClose} onSuccess={onClose} />
			</AsyncPage>
		</div>
	);
};
