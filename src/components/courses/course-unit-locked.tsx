import React from 'react';
import { Link } from 'react-router-dom';
import { CourseUnitModel } from '@/lib/models';

interface CourseUnitLockedProps {
	courseUrlName: string;
	courseUnit: CourseUnitModel;
	dependencyCourseUnits: CourseUnitModel[];
}

export const CourseUnitLocked = ({ courseUrlName, courseUnit, dependencyCourseUnits }: CourseUnitLockedProps) => {
	return (
		<>
			<h2 className="mb-10">{courseUnit.title}</h2>
			<h3 className="mb-6">This unit is locked</h3>
			<p className="fs-large mb-6">Please complete the following units to unlock this unit:</p>
			<ul>
				{dependencyCourseUnits.map((dependencyCourseUnit) => (
					<li key={dependencyCourseUnit.courseUnitId}>
						<Link to={`/courses/${courseUrlName}/course-units/${dependencyCourseUnit.courseUnitId}`}>
							{dependencyCourseUnit.title}
						</Link>
					</li>
				))}
			</ul>
		</>
	);
};
