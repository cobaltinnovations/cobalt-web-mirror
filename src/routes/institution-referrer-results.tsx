import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LoaderFunctionArgs, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';

import FullscreenBar from '@/components/fullscreen-bar';
import useAccount from '@/hooks/use-account';
import { InstitutionReferrer, InstitutionReferrerResultScreen } from '@/lib/models';
import { institutionReferrersService } from '@/lib/services';

enum SEARCH_PARAMS {
	APPOINTMENT_TYPE_ID = 'appointmentTypeId',
	CLINIC_ID = 'clinicId',
	FEATURE_ID = 'featureId',
	PAGE_DESCRIPTION = 'pageDescription',
	PAGE_TITLE = 'pageTitle',
	PROVIDER_ID = 'providerId',
	RETURN_TO = 'returnTo',
}

function resultScreenForKey(
	institutionReferrer: InstitutionReferrer,
	resultKey: string
): InstitutionReferrerResultScreen | null {
	const resultScreen = institutionReferrer.metadata?.resultScreens?.[resultKey];

	if (!resultScreen || typeof resultScreen.recommendation !== 'string' || resultScreen.recommendation.trim() === '') {
		return null;
	}

	return resultScreen;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { urlName, resultKey } = params;

	if (!urlName) {
		throw new Error('urlName is undefined.');
	}

	if (!resultKey) {
		throw new Error('resultKey is undefined.');
	}

	const { institutionReferrer } = await institutionReferrersService.getReferrerByUrlName(urlName).fetch();
	const resultScreen = resultScreenForKey(institutionReferrer, resultKey);

	if (!resultScreen) {
		throw new Response('Result screen not found.', { status: 404 });
	}

	return {
		institutionReferrer,
		resultKey,
		resultScreen,
	};
};

export const Component = () => {
	const { institutionReferrer, resultScreen } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { institution } = useAccount();

	const screeningTitle = institutionReferrer.metadata?.screening?.title ?? institutionReferrer.title;
	const returnTo = searchParams.get(SEARCH_PARAMS.RETURN_TO) ?? `/referrals/${institutionReferrer.urlName}`;
	const bookingPath = resultScreen.booking?.path ?? `/connect-with-support/${institutionReferrer.urlName}`;
	const bookingParams = new URLSearchParams();

	if (resultScreen.booking?.providerId) {
		bookingParams.set(SEARCH_PARAMS.PROVIDER_ID, resultScreen.booking.providerId);
	}

	if (resultScreen.booking?.featureId) {
		bookingParams.set(SEARCH_PARAMS.FEATURE_ID, resultScreen.booking.featureId);
	}

	if (resultScreen.booking?.pageTitle) {
		bookingParams.set(SEARCH_PARAMS.PAGE_TITLE, resultScreen.booking.pageTitle);
	}

	if (resultScreen.booking?.pageDescription) {
		bookingParams.set(SEARCH_PARAMS.PAGE_DESCRIPTION, resultScreen.booking.pageDescription);
	}

	resultScreen.booking?.clinicIds?.forEach((clinicId) => {
		bookingParams.append(SEARCH_PARAMS.CLINIC_ID, clinicId);
	});

	resultScreen.booking?.appointmentTypeIds?.forEach((appointmentTypeId) => {
		bookingParams.append(SEARCH_PARAMS.APPOINTMENT_TYPE_ID, appointmentTypeId);
	});

	return (
		<>
			<Helmet>
				<title>
					{institution.platformName ?? 'Cobalt'} | {screeningTitle}
				</title>
			</Helmet>

			<FullscreenBar
				title={screeningTitle}
				onExit={() => {
					navigate(returnTo);
				}}
			/>

			<Container className="py-8 min-vh-100">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="bg-white border rounded-3 p-8 shadow-sm">
							<h1 className="mb-3 text-center">{resultScreen.title ?? 'Assessment Results'}</h1>
							<p className="mb-6 fs-large text-center">
								{resultScreen.subtitle ?? "Based on your answers, here's what we recommend:"}
							</p>

							<div className="mb-6 p-5 border rounded-3 bg-n75">
								<h2 className="h3 mb-0 text-center">{resultScreen.recommendation}</h2>
							</div>

							{resultScreen.bodyHtml && (
								<div className="mb-0" dangerouslySetInnerHTML={{ __html: resultScreen.bodyHtml }} />
							)}

							{resultScreen.noteHtml && (
								<div
									className="mt-6 p-4 border rounded-3 bg-n75"
									dangerouslySetInnerHTML={{ __html: resultScreen.noteHtml }}
								/>
							)}

							<div className="pt-6 d-flex justify-content-end">
								<Button
									type="button"
									onClick={() => {
										navigate(
											bookingParams.toString().length > 0
												? `${bookingPath}?${bookingParams.toString()}`
												: bookingPath
										);
									}}
								>
									{resultScreen.buttonText ?? 'Continue to Scheduling'}
								</Button>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};
