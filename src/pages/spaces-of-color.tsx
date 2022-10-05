import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { TopicCenterGroupSession } from '@/components/topic-center-group-session';

const SpacesOfColor = () => {
	return (
		<>
			<Container fluid className="bg-n50">
				<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
							<h2 className="mb-2 mb-lg-4 text-center">Monthly Group Sessions</h2>
							<p className="mb-6 mb-lg-12 fs-large text-center">Explainer text goes here.</p>
							<TopicCenterGroupSession
								title="Title"
								titleSecondary="Thu, Aug 8 &bull; 8:00pm"
								titleTertiary="Hosted by: Thea Gallagher, Psy.D."
								description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non nisi nec nisl pellentesque suscipit sit amet at elit. Sed venenatis lorem id vestibulum consectetur. Pellentesque pharetra nunc massa, a efficitur turpis sollicitudin et. Aliquam congue faucibus massa, et euismod urna maximus non. In hendrerit tellus sit amet finibus rutrum. Proin vitae arcu magna. Phasellus ultrices mollis ipsum a tincidunt. Donec ac augue vitae erat facilisis dignissim. Curabitur sem metus, iaculis vel tempor id, porttitor et mi. Fusce a ante id lorem tempor facilisis vitae at lectus. Fusce magna arcu, volutpat vitae efficitur a, bibendum in mauris. Integer in vehicula tellus, id condimentum sem. Nam nec vestibulum magna."
								badgeTitle="5 Seats Left"
								buttonTitle="Join Session"
								onClick={() => {
									window.alert('Button clicked.');
								}}
							/>
						</Col>
					</Row>
				</Container>
			</Container>

			<Container fluid className="bg-n75">
				<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
							<h2 className="mb-2 mb-lg-4 text-center">Spaces of Color - For Your Team</h2>
							<p className="mb-6 mb-lg-12 fs-large text-center">Explainer text goes here.</p>
							<TopicCenterGroupSession
								title="Spaces of Color - For Your Team"
								titleSecondary="By Request"
								description="Spaces of Color events are facilitated, confidential peer support sessions intended for Penn staff, faculty, and trainees who have personal, firsthand experience with racism and racial trauma, including microaggressions. "
								buttonTitle="Request Session"
								onClick={() => {
									window.alert('Button clicked.');
								}}
							/>
						</Col>
					</Row>
				</Container>
			</Container>
		</>
	);
};

export default SpacesOfColor;
