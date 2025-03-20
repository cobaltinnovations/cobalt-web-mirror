import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Container, Row, Tab } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { CourseModel } from '@/lib/models';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';
import { CourseModule } from '@/components/courses';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';

export async function loader() {
	return null;
}

enum TABS {
	COURSE_OVERVIEW = 'COURSE_OVERVIEW',
	ADDITIONAL_RESOURCES = 'ADDITIONAL_RESOURCES',
}

export const Component = () => {
	const { courseIdentifier } = useParams<{ courseIdentifier: string }>();
	const [course, setCourse] = useState<CourseModel>();
	const [currentTab, setCurrentTab] = useState(TABS.COURSE_OVERVIEW);

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
				<title>Cobalt | Courses - Detail</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<PageHeader
					className="bg-p50"
					title={<h1>{course?.title}</h1>}
					descriptionHtml={course?.description}
					imageUrl={course?.imageUrl}
					imageAlt=""
				/>
				<Container>
					<Row className="mb-24">
						<Col>
							<Tab.Container
								id="course-tabs"
								defaultActiveKey={TABS.COURSE_OVERVIEW}
								activeKey={currentTab}
							>
								<TabBar
									value={currentTab}
									tabs={[
										{
											title: 'Course Overview',
											value: TABS.COURSE_OVERVIEW,
										},
										{
											title: 'Additional Resources',
											value: TABS.ADDITIONAL_RESOURCES,
										},
									]}
									onTabClick={(tabValue) => {
										setCurrentTab(tabValue as TABS);
									}}
								/>
								<Tab.Content>
									<Tab.Pane eventKey={TABS.COURSE_OVERVIEW} mountOnEnter unmountOnExit>
										<Row>
											<Col md={12} lg={7}>
												<div className="pt-6 mb-11 d-flex align-items-center justify-content-between">
													<h2 className="mb-0">Course Content</h2>
													<Button type="button">Start Course</Button>
												</div>
												{(course?.courseModules ?? []).map(
													(courseModule, courseModuleIndex) => {
														const isLast =
															(course?.courseModules ?? []).length - 1 ===
															courseModuleIndex;

														return (
															<CourseModule
																className={classNames({
																	'mb-4': !isLast,
																})}
																key={courseModule.courseModuleId}
																courseModule={courseModule}
															/>
														);
													}
												)}
											</Col>
											<Col md={12} lg={5}>
												<h3 className="pt-6 mb-4">Course Focus</h3>
												<WysiwygDisplay className="mb-10" html={course?.focus ?? ''} />
												<hr />
												<h3 className="pt-6 mb-4">Need Help?</h3>
												<Link to="/feedback">Reach out to us here</Link>
											</Col>
										</Row>
									</Tab.Pane>
									<Tab.Pane eventKey={TABS.ADDITIONAL_RESOURCES} mountOnEnter unmountOnExit>
										<div className="pt-6">Additonal Resources</div>
									</Tab.Pane>
								</Tab.Content>
							</Tab.Container>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};
