import Loader from '@/components/loader';
import useAccount from '@/hooks/use-account';
import { StudyOnboardingResponse, accountService, studyService } from '@/lib/services';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { LoaderFunctionArgs, redirect, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { getSubdomain } from '@/lib/utils';
import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';

function useStudyOnboardingLoaderData() {
	return useRouteLoaderData('study-onboarding') as Awaited<ReturnType<typeof loader>>;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const urlName = params.studyIdOrUrlName;
	const immediate = url.searchParams.get('immediate') === 'true' ? true : false;
	const subdomain = getSubdomain(url);

	if (!urlName) {
		throw new Error('urlName is undefined.');
	}

	const onboardingRequest = studyService.fetchStudyOnboarding(urlName);
	request.signal.addEventListener('abort', onboardingRequest.abort);
	const onboardingResponse = await onboardingRequest.fetch();

	// Logic for if the immediate seach param is true
	if (immediate) {
		const onboardingUrl = new URL(onboardingResponse.onboardingDestinationUrl);

		// If the user is already authenticated, immediately redirect them to the onboarding url,
		// skipping the sign-out and permitted account id logic.
		if (Cookies.get('accessToken')) {
			return redirect(onboardingUrl.pathname);
		}

		// If the user is not authenticated, create an anonymous account for them,
		// set the redirect url to the onboarding url, and direct them to the auth route.
		const accountRequest = accountService.createAnonymousAccount({ subdomain });
		request.signal.addEventListener('abort', accountRequest.abort);
		const { accessToken } = await accountRequest.fetch();

		Cookies.set('authRedirectUrl', onboardingUrl.pathname);
		return redirect(`/auth?accessToken=${accessToken}`);
	}

	return onboardingResponse;
};

export const Component = () => {
	const navigate = useNavigate();
	const { account, signOutAndClearContext } = useAccount();
	const { onboardingDestinationUrl, permittedAccountSourceIds } =
		useStudyOnboardingLoaderData() as StudyOnboardingResponse;

	const isLoggedInAndPermitted =
		!!account?.accountSourceId && permittedAccountSourceIds.includes(account.accountSourceId);

	useEffect(() => {
		function redirectToOnboardingDestination() {
			if (onboardingDestinationUrl) {
				window.location.href = onboardingDestinationUrl;
			} else {
				navigate({ pathname: '/sign-in' }, { replace: true });
			}
		}

		if (isLoggedInAndPermitted) {
			redirectToOnboardingDestination();
		} else {
			signOutAndClearContext(AnalyticsNativeEventAccountSignedOutSource.STUDY_ONBOARDING);
			Cookies.set('permittedAccountSourceIds', JSON.stringify(permittedAccountSourceIds));

			redirectToOnboardingDestination();
		}
	}, [isLoggedInAndPermitted, navigate, onboardingDestinationUrl, permittedAccountSourceIds, signOutAndClearContext]);

	return <Loader />;
};
