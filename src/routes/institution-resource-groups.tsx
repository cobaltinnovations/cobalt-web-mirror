import React, { Suspense, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';

import HeroContainer from '@/components/hero-container';
import InstitutionResourceGroupTile from '@/components/institution-resource-group-tile';
import Loader from '@/components/loader';
import { analyticsService, GetInstitutionResourceGroupsResponse, institutionService } from '@/lib/services';
import { Await, LoaderFunctionArgs, useRouteLoaderData } from 'react-router-dom';
import { AnalyticsNativeEventTypeId } from '@/lib/models';
import useAccount from '@/hooks/use-account';

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

	return { institutionResourceGroupsResponse: institutionResourceGroupsRequest.fetch() };
};

export const Component = () => {
	const { institutionResourceGroupsResponse } = useInstitutionResourceGroupsLoaderData();
	const { institution } = useAccount();

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_INSTITUTION_RESOURCES);
	}, []);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Institution Resources</title>
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
