import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import classNames from 'classnames';
import {
	CourseModuleModel,
	CourseSessionUnitStatusIdsByCourseUnitId,
	CourseUnitLockStatusesByCourseUnitId,
	CourseUnitLockTypeId,
	CourseUnitModel,
	CourseUnitTypeId,
} from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { ReactComponent as LockIcon } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as ResourceIcon } from '@/assets/icons/icon-resource.svg';
import { ReactComponent as VideoIcon } from '@/assets/icons/icon-video.svg';
import { ReactComponent as WorksheetIcon } from '@/assets/icons/icon-worksheet.svg';

const courseUnitTypeIdIconMap: Record<CourseUnitTypeId, (size: number) => JSX.Element> = {
	CARD_SORT: (size) => <WorksheetIcon width={size} height={size} />,
	HOMEWORK: (size) => <ResourceIcon width={size} height={size} />,
	INFOGRAPHIC: (size) => <ResourceIcon width={size} height={size} />,
	QUIZ: (size) => <WorksheetIcon width={size} height={size} />,
	REORDER: (size) => <WorksheetIcon width={size} height={size} />,
	VIDEO: (size) => <VideoIcon width={size} height={size} />,
};

interface UseStylesProps {
	compact?: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	courseModule: {
		borderRadius: ({ compact }: UseStylesProps) => (compact ? 0 : 8),
		backgroundColor: theme.colors.n0,
		border: ({ compact }: UseStylesProps) => (compact ? 'none' : `1px solid ${theme.colors.border}`),
	},
	collapseButton: {
		border: 0,
		width: '100%',
		display: 'flex',
		appearance: 'none',
		padding: ({ compact }: UseStylesProps) => (compact ? '12px 16px' : '16px 24px'),
		alignItems: 'center',
		color: theme.colors.n700,
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
		'&:hover': {
			color: theme.colors.p500,
		},
	},
	collapseBody: {
		borderTop: ({ compact }: UseStylesProps) => (compact ? 'none' : `1px solid ${theme.colors.border}`),
		'& ul li.active': {
			backgroundColor: theme.colors.n75,
		},
	},
	courseUnitButton: {
		border: 0,
		width: '100%',
		display: 'flex',
		appearance: 'none',
		padding: ({ compact }: UseStylesProps) => (compact ? '8px 16px' : 8),
		textAlign: 'left',
		alignItems: 'center',
		backgroundColor: 'transparent',
		'&:hover': {
			backgroundColor: theme.colors.n50,
		},
	},
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

interface CourseModuleProps {
	courseModule: CourseModuleModel;
	courseSessionUnitStatusIdsByCourseUnitId: CourseSessionUnitStatusIdsByCourseUnitId;
	courseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
	onCourseUnitClick(courseUnit: CourseUnitModel): void;
	compact?: boolean;
	activeCourseUnitId?: string;
	className?: string;
}

export const CourseModule = ({
	courseModule,
	courseSessionUnitStatusIdsByCourseUnitId,
	courseUnitLockStatusesByCourseUnitId,
	onCourseUnitClick,
	compact = false,
	activeCourseUnitId = '',
	className,
}: CourseModuleProps) => {
	const classes = useStyles({ compact });
	const [show, setShow] = useState(true);

	return (
		<div className={classNames(classes.courseModule, className)}>
			<Button bsPrefix="collapse-button" className={classes.collapseButton} onClick={() => setShow(!show)}>
				<div className="text-left">
					<span
						className={classNames('d-block fw-bold', {
							'fs-large': !compact,
							'fs-normal': compact,
						})}
					>
						{courseModule.title}
					</span>
					{!compact && (
						<span className="d-block fs-default">
							<span className="text-danger">[TODO]: unitsCompleted</span>/
							{courseModule.courseUnits.length} units &bull;{' '}
							{courseModule.estimatedCompletionTimeInMinutesDescription}
						</span>
					)}
				</div>
				<DownChevron
					className="d-flex text-n500"
					style={{ transform: `rotate(${show ? '180deg' : '0deg'})` }}
				/>
			</Button>
			<Collapse in={show}>
				<div className={classes.collapseBody}>
					<div className={classNames({ 'p-4': !compact })}>
						<ul className="m-0 list-unstyled">
							{courseModule.courseUnits.map((courseUnit) => {
								const isLocked =
									courseUnitLockStatusesByCourseUnitId[courseUnit.courseUnitId]
										.courseUnitLockTypeId !== CourseUnitLockTypeId.UNLOCKED;
								const isComplete = Object.keys(courseSessionUnitStatusIdsByCourseUnitId).includes(
									courseUnit.courseUnitId
								);

								return (
									<li
										key={courseUnit.courseUnitId}
										className={classNames({
											active: courseUnit.courseUnitId === activeCourseUnitId,
										})}
									>
										<Button
											bsPrefix="course-unit-button"
											className={classes.courseUnitButton}
											onClick={() => {
												onCourseUnitClick(courseUnit);
											}}
										>
											<div
												className={classNames(classes.iconOuter, {
													complete: isComplete,
												})}
											>
												{isLocked ? (
													<LockIcon width={compact ? 18 : 24} height={compact ? 18 : 24} />
												) : isComplete ? (
													<CheckIcon
														className="text-white"
														width={compact ? 18 : 24}
														height={compact ? 18 : 24}
													/>
												) : (
													courseUnitTypeIdIconMap[courseUnit.courseUnitTypeId](
														compact ? 18 : 24
													)
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
													{courseUnit.courseUnitTypeIdDescription} &bull;{' '}
													{courseUnit.estimatedCompletionTimeInMinutesDescription}
												</span>
											</div>
										</Button>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</Collapse>
		</div>
	);
};
