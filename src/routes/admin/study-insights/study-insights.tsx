import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { AnalyticsWidgetTableCard } from '@/components/admin';

export async function loader() {
	return null;
}

export const Component = () => {
	return (
		<Container fluid className="px-8 py-8">
			<Row className="mb-8">
				<Col>
					<h2 className="mb-0">Study Insights</h2>
				</Col>
			</Row>
			<Row>
				<Col>
					<AnalyticsWidgetTableCard
						widget={{
							widgetTitle: 'All Studies',
							widgetTypeId: 'TABLE',
							widgetData: {
								headers: ['All Studies', 'Participants', 'Start Date', 'End Date'],
								rows: [
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx0">Study Name</a>',
											'1000',
											'2023-08-20',
											'2023-08-20',
										],
									},
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx1">Study Name</a>',
											'1000',
											'2023-08-20',
											'2023-08-20',
										],
									},
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx2">Study Name</a>',
											'1000',
											'2023-08-20',
											'2023-08-20',
										],
									},
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx3">Study Name</a>',
											'1000',
											'2023-08-20',
											'2023-08-20',
										],
									},
								],
							},
						}}
					/>
				</Col>
			</Row>
		</Container>
	);
};
