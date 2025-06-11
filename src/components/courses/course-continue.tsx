import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession } from '@/lib/utils';
import { CourseModel } from '@/lib/models';
import ProgressBar from '@/components/progress-bar';
import { CourseUnitListDisplay } from '@/components/courses';
import { createUseThemedStyles } from '@/jss/theme';
import { useNavigate } from 'react-router-dom';
import useHandleError from '@/hooks/use-handle-error';

const useStyles = createUseThemedStyles((theme) => ({
	courseContiner: {
		padding: 24,
		borderRadius: 16,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
	},
	imageOuter: {
		maxWidth: 142,
		borderRadius: 4,
		overflow: 'hidden',
		'& img': {
			width: '100%',
		},
	},
	courseUnitOuter: {
		padding: 16,
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		border: `1px solid ${theme.colors.border}`,
	},
}));

interface CourseContinueProps {
	course: CourseModel;
	className?: string;
}

export const CourseContinue = ({ course, className }: CourseContinueProps) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const handleError = useHandleError();
	const courseUnit = useMemo(() => {
		const { courseModules, currentCourseSession } = course;

		if (!currentCourseSession) {
			return undefined;
		}

		const courseUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(
			courseModules,
			currentCourseSession
		);

		if (!courseUnitId) {
			return undefined;
		}

		const courseModule = courseModules.find((cm) =>
			cm.courseUnits.map((u) => u.courseUnitId).find((uid) => uid === courseUnitId)
		);

		if (!courseModule) {
			return undefined;
		}

		const currentCourseUnit = courseModule.courseUnits.find((cu) => cu.courseUnitId === courseUnitId);

		return currentCourseUnit;
	}, [course]);

	const handleResumeButtonClick = () => {
		try {
			if (!courseUnit) {
				throw new Error('courseUnit is undefined.');
			}

			navigate(`/courses/${course.urlName}/course-units/${courseUnit.courseUnitId}`);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<div className={classNames(classes.courseContiner, className)}>
			<div className="mb-4 d-flex align-items-center">
				<div className={classNames('me-6', classes.imageOuter)}>
					<img src={course.imageUrl} alt={course.title} />
				</div>
				<div>
					<h4 className="mb-2">{course.title}</h4>
					<p className="mb-0">
						<span className="text-muted">Course</span> &bull; <span className="text-muted">0%</span>
					</p>
				</div>
			</div>
			<ProgressBar className="mb-4" size="lg" current={0} max={100} pill />
			<div className={classes.courseUnitOuter}>
				<div>
					{courseUnit && (
						<CourseUnitListDisplay courseUnit={courseUnit} isComplete={false} isLocked={false} />
					)}
				</div>
				<Button onClick={handleResumeButtonClick}>Resume</Button>
			</div>
		</div>
	);
};
