import React from 'react';
import classNames from 'classnames';

import { CourseUnitModel, CourseUnitTypeId } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '../svg-icon';

const courseUnitTypeIdIconMap: Record<CourseUnitTypeId, (size: number, className?: string) => JSX.Element> = {
	CARD_SORT: (size, className?: string) => (
		<SvgIcon kit="far" icon="clipboard-list-check" size={size} className={className} />
	),
	HOMEWORK: (size, className?: string) => (
		<SvgIcon kit="far" icon="clipboard-list-check" size={size} className={className} />
	),
	INFOGRAPHIC: (size, className?: string) => <SvgIcon kit="far" icon="newspaper" size={size} className={className} />,
	QUIZ: (size, className?: string) => (
		<SvgIcon kit="far" icon="clipboard-list-check" size={size} className={className} />
	),
	REORDER: (size, className?: string) => (
		<SvgIcon kit="far" icon="clipboard-list-check" size={size} className={className} />
	),
	THINGS_TO_SHARE: (size, className?: string) => (
		<SvgIcon kit="far" icon="download" size={size} className={className} />
	),
	VIDEO: (size, className?: string) => <SvgIcon kit="fak" icon="video" size={size} className={className} />,
	FINAL: (size, className?: string) => <SvgIcon kit="far" icon="newspaper" size={size} className={className} />,
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
					<SvgIcon kit="far" icon="lock" size={compact ? 16 : 20} />
				) : isComplete ? (
					<>
						{courseUnit.showUnitAsComplete ? (
							<SvgIcon kit="fak" icon="check" size={compact ? 16 : 20} className="text-white" />
						) : (
							courseUnitTypeIdIconMap[courseUnit.courseUnitTypeId](compact ? 18 : 24, 'text-white')
						)}
					</>
				) : (
					courseUnitTypeIdIconMap[courseUnit.courseUnitTypeId](compact ? 16 : 20)
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
