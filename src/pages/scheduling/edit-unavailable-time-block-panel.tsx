import React, { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';

import { schedulingService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { AvailabilityForm, AvailabilityFormSchema } from './availability-form';
import { AvailabilityFormDataFromLogicalAvailability } from '@/lib/utils/form-utils';
import colors from '@/jss/colors';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';
import useHandleError from '@/hooks/use-handle-error';

interface EditUnavailableTimeBlockPanelProps {
	logicalAvailabilityId?: string;
	onClose: (didUpdate?: boolean) => void;
}

export const EditUnavailableTimeBlockPanel = ({
	logicalAvailabilityId,
	onClose,
}: EditUnavailableTimeBlockPanelProps) => {
	const handleError = useHandleError();
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

	const onCancel = useCallback(() => {
		onClose(false);
	}, [onClose]);

	const onSuccess = useCallback(() => {
		onClose(true);
	}, [onClose]);

	const onDelete = useCallback(() => {
		if (!logicalAvailabilityId || !window.confirm('Confirm Deleting this blocked timeslot?')) {
			return;
		}

		schedulingService
			.deleteLogicalAvailabilitiy(logicalAvailabilityId)
			.fetch()
			.then(() => {
				onClose(true);
			})
			.catch((e) => {
				handleError(e);
			});
	}, [handleError, logicalAvailabilityId, onClose]);

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<Button variant="link" size="sm" className="p-0" onClick={onCancel}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>
				<Button variant="link" size="sm" className="p-0" onClick={onCancel}>
					<CloseIcon />
				</Button>
			</div>

			<AsyncPage fetchData={fetchData} showBackButton={false} showRetryButton={false}>
				<div className="d-flex align-items-center justify-content-between py-4">
					<h5 className="m-0">{logicalAvailabilityId ? 'Edit' : 'Add'} unavailable time block</h5>
					{logicalAvailabilityId && (
						<Button variant="link" size="sm" className="text-danger p-0" onClick={onDelete}>
							delete
						</Button>
					)}
				</div>

				<AvailabilityForm
					logicalAvailabilityId={logicalAvailabilityId}
					logicalAvailabilityTypeId="BLOCK"
					initialValues={initialValues}
					onBack={onCancel}
					onSuccess={onSuccess}
				/>
			</AsyncPage>
		</div>
	);
};
