import React, { Suspense, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import Loader from '@/components/loader';
import useAccount from '@/hooks/use-account';
import { AnalyticsNativeEventTypeId, InstitutionResource, InstitutionResourceGroup } from '@/lib/models';
import { analyticsService, institutionService } from '@/lib/services';
import { Await, LoaderFunctionArgs, defer, useRouteLoaderData } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';

interface InstitutionResourceGroupDetailLoaderData {
	deferredData: Promise<[InstitutionResourceGroup, InstitutionResource[]]>;
}

export function useInstitutionResourceGroupDetailLoaderData() {
	return useRouteLoaderData('institution-resource-group-detail') as InstitutionResourceGroupDetailLoaderData;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const institutionResourceGroupUrlNameOrId = params.institutionResourceGroupUrlNameOrId;

	if (!institutionResourceGroupUrlNameOrId) {
		throw new Error('Unknown institutionResourceGroupUrlNameOrId');
	}

	const institutionResourceGroupRequest = institutionService.getResourceGroupDetail(
		institutionResourceGroupUrlNameOrId
	);
	const institutionResourcesRequest = institutionService.getResourcesByGroup(institutionResourceGroupUrlNameOrId);

	request.signal.addEventListener('abort', () => {
		institutionResourceGroupRequest.abort();
		institutionResourcesRequest.abort();
	});

	return defer({
		deferredData: Promise.all([
			institutionResourceGroupRequest.fetch().then((response) => response.institutionResourceGroup),
			institutionResourcesRequest.fetch().then((response) => response.institutionResources),
		]),
	});
};

const useStyles = createUseThemedStyles((theme) => ({
	imageOuter: {
		borderRadius: 8,
	},
	resourceImage: {
		width: '100%',
		height: 'auto',
		display: 'block',
	},
}));

export const Component = () => {
	const { deferredData } = useInstitutionResourceGroupDetailLoaderData();
	const { institution } = useAccount();
	const classes = useStyles();

	useEffect(() => {
		deferredData.then(([institutionResourceGroup]) => {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_INSTITUTION_RESOURCE_GROUP_DETAIL, {
				institutionResourceGroupId: institutionResourceGroup.institutionResourceGroupId,
			});
		});
	}, [deferredData]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Institution Resources</title>
			</Helmet>
			<Suspense fallback={<Loader />}>
				<Await resolve={deferredData}>
					{([institutionResourceGroup, institutionResources]: Awaited<typeof deferredData>) => {
						return (
							<>
								<HeroContainer className="bg-n75">
									<p className="text-center text-n500 fs-large">{institution.name} Resources</p>

									<h1 className="mb-4 text-center">{institutionResourceGroup.name}</h1>

									<p className="mb-0 text-center fs-large">{institutionResourceGroup.description}</p>
								</HeroContainer>

								<Container className="py-16">
									{institutionResources.map((institutionResource, idx) => {
										const isLast = idx === institutionResources.length - 1;

										return (
											<Row
												key={institutionResource.institutionResourceId}
												className="mb-10 gy-10"
											>
												<Col
													xs={12}
													md={4}
													className="order-md-1 d-flex align-items-center justify-content-center"
												>
													<div className={classes.imageOuter}>
														<img
															className={classes.resourceImage}
															src={institutionResource.imageUrl}
															alt={institutionResource.name}
														/>
													</div>
												</Col>

												<Col xs={12} md={8}>
													<a
														href={institutionResource.url}
														target="_blank"
														rel="noreferrer"
														className="fs-h2"
													>
														{institutionResource.name}
													</a>

													<div
														className="mt-4"
														dangerouslySetInnerHTML={{
															__html: institutionResource.description,
														}}
													/>
												</Col>

												{!isLast && (
													<Col xs={12} className="order-md-3">
														<hr />
													</Col>
												)}
											</Row>
										);
									})}
								</Container>
							</>
						);
					}}
				</Await>
			</Suspense>
		</>
	);
};
