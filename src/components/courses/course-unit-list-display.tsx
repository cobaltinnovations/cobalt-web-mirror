import React from 'react';
import classNames from 'classnames';

import { CourseUnitModel, CourseUnitTypeId } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as ResourceIcon } from '@/assets/icons/icon-resource.svg';
import { ReactComponent as WorksheetIcon } from '@/assets/icons/icon-worksheet.svg';
import SvgIcon from '../svg-icon';

const courseUnitTypeIdIconMap: Record<CourseUnitTypeId, (size: number) => JSX.Element> = {
	CARD_SORT: (size) => <WorksheetIcon width={size} height={size} />,
	HOMEWORK: (size) => <ResourceIcon width={size} height={size} />,
	INFOGRAPHIC: (size) => <ResourceIcon width={size} height={size} />,
	QUIZ: (size) => <WorksheetIcon width={size} height={size} />,
	REORDER: (size) => <WorksheetIcon width={size} height={size} />,
	THINGS_TO_SHARE: (size) => <ResourceIcon width={size} height={size} />,
	VIDEO: (size) => <SvgIcon kit="far" icon="video" size={size} />,
};

interface UseStylesProps {
	compact?: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	iconOuter: {
		width: ({ compact }: UseStylesProps) => (compact ? 24 : 32),
		height: ({ compact }: UseStylesProps) => (compact ? 24 : 32),
		flexShrink: 0,
		display: 'flex',
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.n75,
		'&.complete': {
			backgroundColor: theme.colors.s500,
		},
	},
}));

interface CourseUnitListDisplayProps {
	courseUnit: CourseUnitModel;
	isComplete: boolean;
	isLocked: boolean;
	compact?: boolean;
}

export const CourseUnitListDisplay = ({ courseUnit, isComplete, isLocked, compact }: CourseUnitListDisplayProps) => {
	const classes = useStyles({ compact });

	return (
		<div className="d-flex align-items-center">
			<div className={classNames(classes.iconOuter, { complete: isComplete })}>
				{isLocked ? (
					<SvgIcon kit="far" icon="lock" size={compact ? 18 : 24} />
				) : isComplete ? (
					<>
						{courseUnit.showUnitAsComplete ? (
							<CheckIcon className="text-white" width={compact ? 18 : 24} height={compact ? 18 : 24} />
						) : (
							courseUnitTypeIdIconMap[courseUnit.courseUnitTypeId](compact ? 18 : 24)
						)}
					</>
				) : (
					courseUnitTypeIdIconMap[courseUnit.courseUnitTypeId](compact ? 18 : 24)
				)}
			</div>
			<div className="ps-4">
				<span
					className={classNames('d-block', {
						'fs-large': !compact,
						'fs-default': compact,
					})}
				>
					{courseUnit.title}
				</span>
				<span
					className={classNames('d-block text-gray', {
						'fs-default': !compact,
						'fs-small': compact,
					})}
				>
					{courseUnit.courseUnitTypeIdDescription}
					{courseUnit.estimatedCompletionTimeInMinutesDescription && (
						<> &bull; {courseUnit.estimatedCompletionTimeInMinutesDescription}</>
					)}
				</span>
			</div>
		</div>
	);
};
