import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LoaderFunctionArgs, useRouteLoaderData } from 'react-router-dom';

interface AdminAnalyticsResourcesAndTopicsLoaderData {
	//
}

export function useAdminAnalyticsResourcesAndTopicsLoaderData() {
	return useRouteLoaderData('admin-analytics-group-sessions') as AdminAnalyticsResourcesAndTopicsLoaderData;
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
