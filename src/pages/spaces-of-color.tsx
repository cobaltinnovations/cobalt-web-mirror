import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { Masonry } from '@/components/masonry';
import { TopicCenterGroupSession } from '@/components/topic-center-group-session';
import { TopicCenterPinboardItem } from '@/components/topic-center-pinboard-item';

const SpacesOfColor = () => {
	return (
		<>
			<Container fluid className="bg-n50">
				<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
							<h2 className="mb-2 mb-lg-4 text-center">Topic Center: Scheduled Group Sessions</h2>
							<p className="mb-6 mb-lg-12 fs-large text-center">Explainer text goes here.</p>
							<TopicCenterGroupSession
								title="Title"
								titleSecondary="Thu, Aug 8 &bull; 8:00pm"
								titleTertiary="Hosted by: Thea Gallagher, Psy.D."
								description="Donec odio odio, rhoncus facilisis eleifend eget, ultricies in nisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec ut libero mauris. Sed tempor, ipsum vitae vulputate hendrerit, sapien nisi volutpat lacus, non consequat urna tortor ultricies lorem. Fusce nec elit ex. Aliquam egestas dolor eget urna auctor, a dictum massa laoreet. Suspendisse malesuada aliquet velit et eleifend. Aenean sit amet tortor tincidunt, dignissim tellus ac, fermentum eros. Nullam convallis interdum diam. Nam congue tellus at risus fringilla, eget malesuada mauris vehicula. Etiam sed lacinia nisi. Donec id tellus et ipsum tristique eleifend.

"
								badgeTitle="5 Seats Left"
								buttonTitle="Join Session"
								onClick={() => {
									window.alert('Button clicked.');
								}}
								imageUrl="https://via.placeholder.com/670x420"
							/>
						</Col>
					</Row>
				</Container>
			</Container>

			<Container fluid className="bg-n75">
				<Container className="pt-10 pb-12 pt-lg-14 pb-lg-22">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
							<h2 className="mb-2 mb-lg-4 text-center">Topic Center: Group Sessions by Request</h2>
							<p className="mb-6 mb-lg-12 fs-large text-center">Explainer text goes here.</p>
							<TopicCenterGroupSession
								title="Title"
								titleSecondary="By Request"
								description="Cras vel rhoncus dolor. Cras lobortis ex id nibh efficitur laoreet. Phasellus vulputate condimentum massa vel sodales. Curabitur finibus urna vel nisl laoreet laoreet. Cras nibh mi, accumsan eget rhoncus in, tristique ut purus. Etiam in felis dui. In vitae scelerisque mauris. Praesent non tellus et turpis mollis tristique eget convallis eros. Sed dictum magna nec felis maximus, id porta ex hendrerit. Integer odio dui, bibendum sed pretium quis, feugiat et nisl. Nunc tempus interdum ipsum, nec vehicula justo. Vivamus euismod mauris fermentum turpis tempus, et malesuada felis bibendum."
								buttonTitle="Request Session"
								onClick={() => {
									window.alert('Button clicked.');
								}}
								imageUrl="https://via.placeholder.com/670x420"
							/>
						</Col>
					</Row>
				</Container>
			</Container>

			<Container fluid className="bg-n50">
				<Container fluid="lg" className="pt-10 pb-12 pt-lg-14 pb-lg-22">
					<Row>
						<Col>
							<h2 className="mb-2 mb-lg-4 text-center">Topic Center: Pinboard</h2>
							<p className="mb-6 mb-lg-12 fs-large text-center">Explainer text goes here.</p>
							<Masonry>
								<TopicCenterPinboardItem
									className="mb-lg-8"
									title="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
									description={
										'Fusce id est eu augue lobortis luctus faucibus consectetur quam. Nam vestibulum, leo eget condimentum tincidunt, tellus sem dictum diam, vel fringilla felis magna vel mauris. Donec euismod sodales mi et convallis. Suspendisse ac tortor eu purus posuere pulvinar id sit amet urna. Mauris tristique malesuada mauris quis lobortis. Nam blandit purus ut enim eleifend pharetra. Phasellus sed ultricies tellus, eu placerat odio.'
									}
									url="https://www.google.com/"
									imageUrl="https://via.placeholder.com/160x160"
								/>
								<TopicCenterPinboardItem
									className="mb-lg-8"
									title="Vestibulum sed mauris in lorem suscipit porttitor sollicitudin vel lectus."
									description={
										'Mauris semper aliquam sem in facilisis. Duis ut lacinia ante. Nam tempus nec turpis quis viverra. Morbi vitae malesuada quam, ac iaculis tellus. Maecenas ex enim, interdum eget rutrum commodo, viverra at felis. Nullam accumsan, velit a ultricies eleifend, urna orci facilisis ligula, eget mollis justo nulla eget quam. Fusce vel mattis mi. Nulla malesuada, nibh vel laoreet sodales, urna ante ullamcorper enim, in ornare nunc ante et turpis. Fusce arcu mi, venenatis tristique ex in, interdum condimentum neque.'
									}
									url="https://www.google.com/"
									imageUrl="https://via.placeholder.com/160x160"
								/>
								<TopicCenterPinboardItem
									className="mb-lg-8"
									title="Aenean porttitor dui nec est finibus, ullamcorper commodo enim gravida."
									description={
										'Duis tempus semper justo vel lacinia. Donec sollicitudin, massa sit amet sodales finibus, arcu risus interdum enim, eget vestibulum mauris felis in risus. Nunc ac viverra justo. In in luctus quam. Quisque augue risus, finibus at lectus vitae, cursus posuere neque. Nullam feugiat enim nec lacinia imperdiet. Integer varius volutpat ante sit amet congue.'
									}
									url="https://www.google.com/"
									imageUrl="https://via.placeholder.com/160x160"
								/>
								<TopicCenterPinboardItem
									className="mb-lg-8"
									title="Nunc dapibus ipsum vel lectus tincidunt placerat."
									description={
										'Quisque condimentum auctor felis, sit amet vehicula dolor laoreet hendrerit. Aliquam id mi tristique, tincidunt lectus non, dignissim arcu. Sed quam magna, interdum a risus nec, vestibulum volutpat libero. Sed placerat convallis malesuada. In hac habitasse platea dictumst. Etiam eget quam efficitur, euismod mi at, posuere turpis. Ut commodo nibh in ullamcorper scelerisque. Curabitur id ornare urna. Aliquam fermentum enim nec purus placerat, sed porta sem tincidunt. Vestibulum varius sodales libero sit amet iaculis. Vivamus efficitur sagittis dolor et ullamcorper. Duis pretium consequat dolor, et cursus lacus scelerisque vel. Morbi viverra porttitor nibh tempus efficitur.'
									}
									url="https://www.google.com/"
									imageUrl="https://via.placeholder.com/160x160"
								/>
								<TopicCenterPinboardItem
									className="mb-lg-8"
									title="Pellentesque eget enim scelerisque nunc egestas vehicula sit amet id lectus."
									description={
										'Etiam sem dui, rhoncus at dolor non, sodales dapibus tellus. Proin et risus eget quam pulvinar rutrum. Integer rhoncus, est in gravida ornare, metus est sagittis tellus, vitae feugiat ligula odio a neque. Praesent malesuada tortor ullamcorper, lacinia eros eget, posuere leo. Cras rutrum tempor ligula, ac cursus urna rhoncus quis. Phasellus vel placerat tortor. Donec ante urna, lacinia sit amet egestas sit amet, pellentesque et urna. Curabitur gravida aliquam ante, sit amet fringilla lorem. Cras quis tempor augue, sed fermentum orci. Donec commodo, velit ut euismod accumsan, tortor turpis pretium elit, nec efficitur nunc lacus vel augue. Vestibulum et congue arcu.'
									}
									url="https://www.google.com/"
									imageUrl="https://via.placeholder.com/160x160"
								/>
								<TopicCenterPinboardItem
									className="mb-lg-8"
									title="Cras porttitor diam nec dapibus ultrices."
									description={
										'In non elit dignissim, imperdiet enim vitae, tincidunt nibh. Morbi quis purus ultrices, suscipit tortor sed, vehicula mi. Nullam augue ante, sagittis ac tortor sit amet, feugiat suscipit ipsum. Mauris in mi vel risus egestas dapibus. Praesent cursus ante at ipsum aliquam egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum eu sapien purus. In hac habitasse platea dictumst. In dignissim mauris in sagittis eleifend. Ut cursus libero ac malesuada porttitor. Nunc sodales urna orci, eget semper nisl aliquam vitae. Sed eget mauris sed nisl faucibus molestie. Maecenas ac tincidunt orci.'
									}
									url="https://www.google.com/"
									imageUrl="https://via.placeholder.com/160x160"
								/>
							</Masonry>
						</Col>
					</Row>
				</Container>
			</Container>
		</>
	);
};

export default SpacesOfColor;
