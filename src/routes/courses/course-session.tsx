import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CourseModel } from '@/lib/models';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	wrapper: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		position: 'fixed',
	},
	header: {
		top: 0,
		left: 0,
		right: 0,
		height: 60,
		zIndex: 3,
		display: 'flex',
		padding: '0 24px',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	aside: {
		top: 60,
		left: 0,
		bottom: 0,
		zIndex: 2,
		width: 344,
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	previewPane: {
		top: 60,
		left: 344,
		right: 0,
		bottom: 0,
		zIndex: 0,
		padding: 24,
		overflowY: 'auto',
		position: 'absolute',
		backgroundColor: theme.colors.n75,
	},
}));

export async function loader() {
	return null;
}

export const Component = () => {
	const classes = useStyles();
	const { courseIdentifier } = useParams<{ courseIdentifier: string }>();
	const [course, setCourse] = useState<CourseModel>();

	const fetchData = useCallback(async () => {
		if (!courseIdentifier) {
			throw new Error('courseIdentifier is undefined.');
		}

		const response = await coursesService.getCourseDetail(courseIdentifier).fetch();
		setCourse(response.course);
	}, [courseIdentifier]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Session</title>
			</Helmet>
			<AsyncWrapper fetchData={fetchData}>
				<div className={classes.wrapper}>
					{/* path matching logic in components/header-v2.tsx hides the default header */}
					<div className={classes.header}>{course?.title}</div>
					<div className={classes.aside}>aside content</div>
					<div className={classes.previewPane}>preview pane content</div>
				</div>
			</AsyncWrapper>
		</>
	);
};
