import React from 'react';
import { Button } from 'react-bootstrap';
import { CourseUnitModel } from '@/lib/models';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import NoData from '@/components/no-data';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

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
					<RightChevron className="ms-1" />
				</Button>
			</div>
		</>
	);
};
