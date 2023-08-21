import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, useRouteLoaderData } from 'react-router-dom';

interface AdminAnalyticsAssessmentsAndAppointmentsLoaderData {
	//
}

export function useAdminAnalyticsAssessmentsAndAppointmentsLoaderData() {
	return useRouteLoaderData(
		'admin-analytics-assessments-and-appointments'
	) as AdminAnalyticsAssessmentsAndAppointmentsLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	// const url = new URL(request.url);

	return {
		//
	};
}

export const Component = () => {
	return (
		<Container fluid>
			<Row>
				<Col>
					<h3>--wip--</h3>
				</Col>
			</Row>
		</Container>
	);
};
