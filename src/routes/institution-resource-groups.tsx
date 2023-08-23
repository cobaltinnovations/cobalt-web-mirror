import React, { Suspense } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import InstitutionResourceGroupTile from '@/components/institution-resource-group-tile';
import Loader from '@/components/loader';
import { GetInstitutionResourceGroupsResponse, institutionService } from '@/lib/services';
import { Await, LoaderFunctionArgs, defer, useRouteLoaderData } from 'react-router-dom';

interface InstitutionResourceGroupsLoaderData {
	institutionResourceGroupsResponse: Promise<GetInstitutionResourceGroupsResponse[]>;
}

export function useInstitutionResourceGroupsLoaderData() {
	return useRouteLoaderData('institution-resource-groups') as InstitutionResourceGroupsLoaderData;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const institutionResourceGroupsRequest = institutionService.getResourceGroups();

	request.signal.addEventListener('abort', () => {
		institutionResourceGroupsRequest.abort();
	});

	return defer({
		institutionResourceGroupsResponse: institutionResourceGroupsRequest.fetch(),
	});
};

export const Component = () => {
	const { institutionResourceGroupsResponse } = useInstitutionResourceGroupsLoaderData();

	return (
		<>
			<Helmet>
				<title>Cobalt | Institution Resources</title>
			</Helmet>

			<Suspense fallback={<Loader />}>
				<Await resolve={institutionResourceGroupsResponse}>
					{(institutionResourceGroupsResponse: GetInstitutionResourceGroupsResponse) => {
						return (
							<>
								<HeroContainer className="bg-n75">
									<h1 className="mb-4 text-center">
										{institutionResourceGroupsResponse.institutionResourceGroupsTitle}
									</h1>

									<p className="mb-0 text-center fs-large">
										{institutionResourceGroupsResponse.institutionResourceGroupsDescription}
									</p>
								</HeroContainer>

								<Container className="py-16">
									<Row>
										{institutionResourceGroupsResponse.institutionResourceGroups.map(
											(institutionResourceGroup) => {
												return (
													<Col
														key={institutionResourceGroup.institutionResourceGroupId}
														xs={12}
														md={6}
														lg={3}
														className="mb-8"
													>
														<InstitutionResourceGroupTile
															institutionResourceGroup={institutionResourceGroup}
														/>
													</Col>
												);
											}
										)}
									</Row>
								</Container>
							</>
						);
					}}
				</Await>
			</Suspense>
		</>
	);
};
