import React from 'react';
import { Button } from 'react-bootstrap';

import { AvailabilityForm } from './availability-form';
import colors from '@/jss/colors';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as ChevronLeftIcon } from '@/assets/icons/icon-chevron-left.svg';

interface EditAvailabilityPanelProps {
	onClose: () => void;
}

export const EditAvailabilityPanel = ({ onClose }: EditAvailabilityPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<ChevronLeftIcon fill={colors.primary} className="mr-1" />
					back
				</Button>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<CloseIcon />
				</Button>
			</div>

			<div className="d-flex align-items-center justify-content-between py-4">
				<h5 className="m-0">Edit availability</h5>

				<Button variant="link" size="sm" className="text-danger p-0" onClick={() => onClose()}>
					delete
				</Button>
			</div>

			<AvailabilityForm
				onBack={() => {
					onClose();
				}}
				onSuccess={() => {
					onClose();
				}}
			/>
		</div>
	);
};
