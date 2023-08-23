import React, { Suspense } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import Loader from '@/components/loader';
import RenderJson from '@/components/render-json';
import useAccount from '@/hooks/use-account';
import { InstitutionResource } from '@/lib/models';
import { institutionService } from '@/lib/services';
import { Await, LoaderFunctionArgs, defer, useRouteLoaderData } from 'react-router-dom';

interface InstitutionResourceGroupDetailLoaderData {
	institutionResourceGroupDetailPromise: Promise<InstitutionResource[]>;
}

export function useInstitutionResourceGroupDetailLoaderData() {
	return useRouteLoaderData('institution-resource-group-detail') as InstitutionResourceGroupDetailLoaderData;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const institutionResourceGroupUrlNameOrId = params.institutionResourceGroupUrlNameOrId;

	if (!institutionResourceGroupUrlNameOrId) {
		throw new Error('Unknown institutionResourceGroupUrlNameOrId');
	}

	const institutionResourceGroupDetailRequest = institutionService.getResourcesByGroup(
		institutionResourceGroupUrlNameOrId
	);

	request.signal.addEventListener('abort', () => {
		institutionResourceGroupDetailRequest.abort();
	});

	return defer({
		institutionResourceGroupDetailPromise: institutionResourceGroupDetailRequest
			.fetch()
			.then((response) => response.institutionResources),
	});
};

export const Component = () => {
	const { institutionResourceGroupDetailPromise } = useInstitutionResourceGroupDetailLoaderData();
	const { institution } = useAccount();

	console.log({ institutionResourceGroupDetailPromise });
	return (
		<>
			<Helmet>
				<title>Cobalt | Institution Resources</title>
			</Helmet>
			<Suspense fallback={<Loader />}>
				<Await resolve={institutionResourceGroupDetailPromise}>
					{(institutionResources: InstitutionResource[]) => {
						console.log({ institutionResources });
						return (
							<>
								<HeroContainer className="bg-n75">
									<p className="text-center text-n500 fs-large">{institution.name} Resources</p>

									<h1 className="mb-4 text-center">__Group Title__</h1>

									<p className="mb-0 text-center fs-large">__Group Description or Disclaimer__</p>
								</HeroContainer>

								<Container className="py-16">
									<Row>
										<Col>
											<RenderJson json={institutionResources} />
										</Col>
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
