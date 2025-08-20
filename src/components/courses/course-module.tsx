import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import classNames from 'classnames';
import {
	CourseModuleModel,
	CourseSessionUnitStatusIdsByCourseUnitId,
	CourseUnitLockStatusesByCourseUnitId,
	CourseUnitLockTypeId,
	CourseUnitModel,
} from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import { CourseUnitListDisplay } from './course-unit-list-display';
import SvgIcon from '../svg-icon';

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
			position: 'relative',
			backgroundColor: theme.colors.n75,
			'&:before': {
				top: 0,
				left: 0,
				width: 4,
				bottom: 0,
				content: '""',
				position: 'absolute',
				backgroundColor: theme.colors.p500,
			},
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
		color: theme.colors.n900,
		backgroundColor: 'transparent',
		'&:hover': {
			backgroundColor: theme.colors.n50,
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
	initialShow?: boolean;
	className?: string;
}

export const CourseModule = ({
	courseModule,
	courseSessionUnitStatusIdsByCourseUnitId,
	courseUnitLockStatusesByCourseUnitId,
	onCourseUnitClick,
	compact = false,
	activeCourseUnitId = '',
	initialShow,
	className,
}: CourseModuleProps) => {
	const classes = useStyles({ compact });
	const [show, setShow] = useState(typeof initialShow !== 'undefined' ? initialShow : true);

	const completeCourseUnits = courseModule.courseUnits.filter((cu) =>
		Object.keys(courseSessionUnitStatusIdsByCourseUnitId).includes(cu.courseUnitId)
	).length;
	const totalCourseUnits = courseModule.courseUnits.length;

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
							{completeCourseUnits}/{totalCourseUnits} unit{totalCourseUnits === 1 ? '' : 's'} &bull;{' '}
							{courseModule.estimatedCompletionTimeInMinutesDescription}
						</span>
					)}
				</div>
				<SvgIcon
					kit="far"
					icon="chevron-down"
					size={16}
					className="d-flex text-n500 flex-shrink-0"
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
										.courseUnitLockTypeId === CourseUnitLockTypeId.STRONGLY_LOCKED;
								const isComplete = Object.keys(courseSessionUnitStatusIdsByCourseUnitId).includes(
									courseUnit.courseUnitId
								);
								const isActive = courseUnit.courseUnitId === activeCourseUnitId;

								return (
									<li key={courseUnit.courseUnitId} className={classNames({ active: isActive })}>
										<Button
											bsPrefix="course-unit-button"
											className={classes.courseUnitButton}
											onClick={() => {
												onCourseUnitClick(courseUnit);
											}}
										>
											<CourseUnitListDisplay
												courseUnit={courseUnit}
												isComplete={isComplete}
												isLocked={isLocked}
												compact={compact}
											/>
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
