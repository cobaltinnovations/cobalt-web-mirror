import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Container, Row, Tab } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { CourseModel } from '@/lib/models';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';

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
										course overview
									</Tab.Pane>
									<Tab.Pane eventKey={TABS.ADDITIONAL_RESOURCES} mountOnEnter unmountOnExit>
										Additonal Resources
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
