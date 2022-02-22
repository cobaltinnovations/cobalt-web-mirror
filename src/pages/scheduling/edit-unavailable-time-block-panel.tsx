import React, { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';

import { schedulingService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { AvailabilityForm, AvailabilityFormSchema } from './availability-form';
import { AvailabilityFormDataFromLogicalAvailability } from '@/lib/utils/form-utils';
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
	const [initialValues, setInitialValues] = useState<AvailabilityFormSchema>();

	const fetchData = useCallback(async () => {
		// Return instead of throwing error
		// if no logicalAvailabilityId, we are creating a new one
		if (!logicalAvailabilityId) {
			return;
		}

		const { logicalAvailability } = await schedulingService.getLogicalAvailability(logicalAvailabilityId).fetch();
		setInitialValues(AvailabilityFormDataFromLogicalAvailability(logicalAvailability));
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

				<AvailabilityForm
					logicalAvailabilityId={logicalAvailabilityId}
					logicalAvailabilityTypeId="BLOCK"
					initialValues={initialValues}
					onBack={onClose}
					onSuccess={onClose}
				/>
			</AsyncPage>
		</div>
	);
};
