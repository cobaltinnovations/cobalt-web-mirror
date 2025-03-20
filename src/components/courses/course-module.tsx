import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import classNames from 'classnames';
import {
	CourseModuleModel,
	CourseUnitLockStatusesByCourseUnitId,
	CourseUnitLockTypeId,
	CourseUnitTypeId,
} from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { ReactComponent as LockIcon } from '@/assets/icons/icon-lock.svg';
import { ReactComponent as ClipboardIcon } from '@/assets/icons/icon-clipboard.svg';
import { ReactComponent as VideoIcon } from '@/assets/icons/icon-video.svg';

const courseUnitTypeIdIconMap: Record<CourseUnitTypeId, JSX.Element | null> = {
	VIDEO: <VideoIcon width={24} height={24} />,
	INFOGRAPHIC: null,
	HOMEWORK: null,
	CARD_SORT: null,
	QUIZ: <ClipboardIcon width={24} height={24} />,
	REORDER: null,
};

const useStyles = createUseThemedStyles((theme) => ({
	courseModule: {
		borderRadius: 8,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
	},
	header: {
		border: 0,
		width: '100%',
		display: 'flex',
		appearance: 'none',
		padding: '16px 24px',
		alignItems: 'center',
		color: theme.colors.n700,
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
		'&:hover': {
			color: theme.colors.p500,
		},
	},
	body: {
		borderTop: `1px solid ${theme.colors.border}`,
	},
	iconOuter: {
		width: 32,
		height: 32,
		flexShrink: 0,
		display: 'flex',
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.n75,
	},
}));

interface CourseModuleProps {
	courseModule: CourseModuleModel;
	courseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
	className?: string;
}

export const CourseModule = ({ courseModule, courseUnitLockStatusesByCourseUnitId, className }: CourseModuleProps) => {
	const classes = useStyles();
	const [show, setShow] = useState(true);

	return (
		<div className={classNames(classes.courseModule, className)}>
			<Button className={classes.header} bsPrefix="collapse-button" onClick={() => setShow(!show)}>
				<div className="text-left">
					<span className="d-block fs-large fw-bold">{courseModule.title}</span>
					<span className="d-block fs-default">
						<span className="text-danger">[TODO]: unitsCompleted</span>/{courseModule.courseUnits.length}{' '}
						units &bull; {courseModule.estimatedCompletionTimeInMinutesDescription}
					</span>
				</div>
				<DownChevron
					className="d-flex text-n500"
					style={{ transform: `rotate(${show ? '180deg' : '0deg'})` }}
				/>
			</Button>
			<Collapse in={show}>
				<div className={classes.body}>
					<div className="p-4">
						<ul className="m-0 list-unstyled">
							{courseModule.courseUnits.map((courseUnit) => (
								<li key={courseUnit.courseUnitId} className="d-flex align-items-center">
									<div className={classes.iconOuter}>
										{courseUnitLockStatusesByCourseUnitId[courseUnit.courseUnitId]
											.courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED ? (
											courseUnitTypeIdIconMap[courseUnit.courseUnitTypeId]
										) : (
											<LockIcon width={24} height={24} />
										)}
									</div>
									<div>
										<span className="d-block fs-large">{courseUnit.title}</span>
										<span className="d-block fs-default text-gray">
											<span className="text-danger">[TODO]: unitTypeDescription</span> &bull;
											<span className="text-danger">[TODO]: completionTimeDescription</span>
										</span>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Collapse>
		</div>
	);
};
