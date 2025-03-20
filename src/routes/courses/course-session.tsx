import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CourseModel } from '@/lib/models';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { createUseThemedStyles } from '@/jss/theme';
import useAccount from '@/hooks/use-account';
import { ScreeningFlow } from '@/components/screening-v2';
import { Col, Container, Row } from 'react-bootstrap';

const headerHeight = 60;
const asideWidth = 344;

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
		height: headerHeight,
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
		top: headerHeight,
		left: 0,
		bottom: 0,
		zIndex: 2,
		width: asideWidth,
		overflowY: 'auto',
		padding: '24px 16px',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	previewPane: {
		top: headerHeight,
		left: asideWidth,
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
	const { institution } = useAccount();

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
					<div className={classes.header}>{course?.title}</div>
					<div className={classes.aside}>
						aside content{' '}
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vehicula, nulla sed finibus
							faucibus, mi risus ultricies mauris, sed consequat nunc mi ac sem. Morbi porta neque non
							risus placerat condimentum. Proin rhoncus tincidunt pellentesque. Phasellus porta sem ac
							imperdiet ullamcorper. Maecenas vulputate, ex ac hendrerit tristique, erat lectus malesuada
							nisi, tincidunt sollicitudin sem mi in felis. Morbi ut iaculis lacus, ut iaculis risus. Sed
							placerat ipsum id lacus volutpat aliquam. Duis porttitor dui a rhoncus blandit. Maecenas
							aliquam arcu vitae ex porta ornare. Phasellus molestie risus ut nunc interdum, at
							sollicitudin justo auctor. Nullam arcu lorem, eleifend ac porta et, tincidunt ut ante.
						</p>
					</div>
					<div className={classes.previewPane}>
						<Container>
							<Row>
								<Col md={12} lg={{ offset: 1, span: 10 }}>
									{institution.onboardingScreeningFlowId && (
										<ScreeningFlow screeningFlowId={institution.onboardingScreeningFlowId} />
									)}
								</Col>
							</Row>
						</Container>
					</div>
				</div>
			</AsyncWrapper>
		</>
	);
};
