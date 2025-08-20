import React from 'react';
import { Button } from 'react-bootstrap';
import { CourseUnitModel } from '@/lib/models';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import NoData from '@/components/no-data';
import SvgIcon from '../svg-icon';

interface CourseUnitCompleteProps {
	courseUnit: CourseUnitModel;
	onRestartActivityButtonClick(): void;
	onNextButtonClick(): void;
}

export const CourseUnitComplete = ({
	courseUnit,
	onRestartActivityButtonClick,
	onNextButtonClick,
}: CourseUnitCompleteProps) => {
	return (
		<>
			<h2 className="mb-10">{courseUnit.title}</h2>
			{courseUnit.description && <WysiwygDisplay className="mb-8" html={courseUnit.description ?? ''} />}
			<NoData
				className="mb-10 bg-white"
				title="Activity Complete"
				actions={[
					{
						variant: 'light',
						className: 'ps-3',
						icon: <SvgIcon kit="fas" icon="arrow-rotate-left" size={16} className="me-2" />,
						title: 'Restart Activity',
						onClick: onRestartActivityButtonClick,
					},
				]}
			/>
			<div className="d-flex justify-content-end">
				<Button
					type="button"
					variant="primary"
					className="d-flex align-items-center text-decoration-none pe-3"
					onClick={onNextButtonClick}
				>
					Next
					<SvgIcon kit="far" icon="chevron-right" size={16} className="ms-1" />
				</Button>
			</div>
		</>
	);
};
