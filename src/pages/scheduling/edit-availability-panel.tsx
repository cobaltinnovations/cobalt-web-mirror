import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import { schedulingService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { AvailabilityForm, AvailabilityFormSchema } from './availability-form';
import { AvailabilityFormDataFromLogicalAvailability } from '@/lib/utils/form-utils';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';
import useHandleError from '@/hooks/use-handle-error';
import { useLocation, useParams } from 'react-router-dom';
import { useCobaltTheme } from '@/jss/theme';

interface EditAvailabilityPanelProps {
	onClose: (logicalAvailabilityId?: string) => void;
}

export const EditAvailabilityPanel = ({ onClose }: EditAvailabilityPanelProps) => {
	const theme = useCobaltTheme();
	const location = useLocation();
	const { logicalAvailabilityId } = useParams<{ logicalAvailabilityId?: string }>();
	const handleError = useHandleError();
	const [initialValues, setInitialValues] = useState<AvailabilityFormSchema>();
	const [isBlockedSlot, setIsBlockedSlot] = useState(false);
	const [closePanel, setClosePanel] = useState(false);

	useEffect(() => {
		if (location.pathname.endsWith('new-blocked-time')) {
			setIsBlockedSlot(true);
		}
	}, [location.pathname]);

	const fetchData = useCallback(async () => {
		// Return instead of throwing error
		// if no logicalAvailabilityId, we are creating a new one
		if (!logicalAvailabilityId) {
			return;
		}

		try {
			const { logicalAvailability } = await schedulingService
				.getLogicalAvailability(logicalAvailabilityId)
				.fetch();
			setInitialValues(AvailabilityFormDataFromLogicalAvailability(logicalAvailability));
			setIsBlockedSlot(logicalAvailability.logicalAvailabilityTypeId === 'BLOCK');
		} catch (e) {
			if ((e as any).code === 'NOT_FOUND') {
				setClosePanel(true);
				return;
			}

			throw e;
		}
	}, [logicalAvailabilityId]);

	const onDelete = useCallback(() => {
		if (
			!logicalAvailabilityId ||
			!window.confirm(`Confirm Deleting this ${isBlockedSlot ? 'blocked timeslot' : 'availability'}?`)
		) {
			return;
		}

		schedulingService
			.deleteLogicalAvailabilitiy(logicalAvailabilityId)
			.fetch()
			.then(() => {
				onClose();
			})
			.catch((e) => {
				handleError(e);
			});
	}, [handleError, isBlockedSlot, logicalAvailabilityId, onClose]);

	useEffect(() => {
		closePanel && onClose();
	}, [closePanel, onClose]);

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<Button
					data-testid="editAvailabilityBackButton"
					variant="link"
					size="sm"
					className="p-0"
					onClick={() => onClose(logicalAvailabilityId)}
				>
					<ChevronLeftIcon fill={theme.colors.p500} className="me-1" />
					Back
				</Button>
				<Button
					data-testid="editAvailabilityCloseButton"
					variant="link"
					size="sm"
					className="p-0"
					onClick={() => onClose()}
				>
					<CloseIcon />
				</Button>
			</div>

			<AsyncPage fetchData={fetchData} showBackButton={false} showRetryButton={false}>
				<div className="d-flex align-items-center justify-content-between py-4">
					<h5 className="m-0">
						{logicalAvailabilityId ? 'edit' : 'new'}{' '}
						{isBlockedSlot ? 'unavailable time block' : 'availability'}
					</h5>
					{logicalAvailabilityId && (
						<Button
							data-testid="editAvailabilityDeleteButton"
							variant="link"
							size="sm"
							className="text-danger p-0"
							onClick={onDelete}
						>
							Delete
						</Button>
					)}
				</div>

				<AvailabilityForm
					logicalAvailabilityId={logicalAvailabilityId}
					logicalAvailabilityTypeId={isBlockedSlot ? 'BLOCK' : 'OPEN'}
					initialValues={initialValues}
					onBack={() => onClose(logicalAvailabilityId)}
					onSuccess={(logicalAvailability) => onClose(logicalAvailability.logicalAvailabilityId)}
				/>
			</AsyncPage>
		</div>
	);
};
