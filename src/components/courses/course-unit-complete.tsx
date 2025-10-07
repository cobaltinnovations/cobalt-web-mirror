import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { CourseUnitModel, CourseUnitTypeId } from '@/lib/models';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import NoData from '@/components/no-data';
import SvgIcon from '../svg-icon';

interface CourseUnitCompleteProps {
	courseUnit: CourseUnitModel;
	completionMessages: Record<string, string>;
	onRestartActivityButtonClick(): void;
	onNextButtonClick(): void;
}

export const CourseUnitComplete = ({
	courseUnit,
	completionMessages,
	onRestartActivityButtonClick,
	onNextButtonClick,
}: CourseUnitCompleteProps) => {
	const completionMessage = useMemo(
		() => completionMessages[courseUnit.courseUnitId] ?? '',
		[completionMessages, courseUnit.courseUnitId]
	);

	return (
		<>
			<h2 className="mb-10">{courseUnit.title}</h2>
			{courseUnit.description && <WysiwygDisplay className="mb-8 fs-large" html={courseUnit.description ?? ''} />}
			<NoData
				className="mb-10 bg-white"
				title="Activity Complete"
				description={completionMessage}
				actions={[
					{
						variant: 'light',
						className: 'ps-3',
						icon: <SvgIcon kit="far" icon="arrow-rotate-left" size={16} className="me-2" />,
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
					{courseUnit.courseUnitTypeId === CourseUnitTypeId.FINAL ? 'Go to course home' : 'Next'}
					<SvgIcon kit="far" icon="chevron-right" size={16} className="ms-1" />
				</Button>
			</div>
		</>
	);
};
