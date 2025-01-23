import React from 'react';
import { Button } from 'react-bootstrap';
import { ReactComponent as BackArrowIcon } from '@/assets/icons/icon-back-arrow.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-delete.svg';

interface RowSettingsHeaderProps {
	title: string;
	onBackButtonClick(): void;
	onDeleteButtonClick(): void;
}

export const RowSettingsHeader = ({ title, onBackButtonClick, onDeleteButtonClick }: RowSettingsHeaderProps) => {
	return (
		<div className="w-100 d-flex align-items-center justify-content-between">
			<div className="d-flex align-items-center">
				<Button variant="link" className="p-2 me-2" onClick={onBackButtonClick}>
					<BackArrowIcon />
				</Button>
				<h5 className="mb-0">{title}</h5>
			</div>
			<Button variant="link" className="p-2" onClick={onDeleteButtonClick}>
				<TrashIcon />
			</Button>
		</div>
	);
};
