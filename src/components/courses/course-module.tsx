import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import classNames from 'classnames';
import { CourseModuleModel, CourseUnitLockStatusesByCourseUnitId } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';

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
									{courseUnitLockStatusesByCourseUnitId[courseUnit.courseUnitId].courseUnitLockTypeId}
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
