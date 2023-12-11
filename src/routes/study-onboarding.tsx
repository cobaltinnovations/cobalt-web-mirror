import Loader from '@/components/loader';
import useAccount from '@/hooks/use-account';
import { StudyOnboardingResponse, accountService, studyService } from '@/lib/services';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { LoaderFunctionArgs, redirect, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { getSubdomain } from '@/lib/utils';

function useStudyOnboardingLoaderData() {
	return useRouteLoaderData('study-onboarding') as Awaited<ReturnType<typeof loader>>;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const urlName = params.studyIdOrUrlName;
	const immediate = url.searchParams.get('immediate') === 'true' ? true : false;
	const subdomain = getSubdomain(url);

	if (immediate) {
		const { accessToken } = await accountService
			.createAnonymousAccount({
				subdomain,
			})
			.fetch();

		Cookies.set('authRedirectUrl', url.pathname);
		return redirect(`/auth?accessToken=${accessToken}`);
	}

	if (!urlName) {
		throw new Error('urlName is undefined.');
	}

	const onboardingRequest = studyService.fetchStudyOnboarding(urlName);

	request.signal.addEventListener('abort', () => {
		onboardingRequest.abort();
	});

	const response = await onboardingRequest.fetch();

	return response;
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
			signOutAndClearContext();
			Cookies.set('permittedAccountSourceIds', JSON.stringify(permittedAccountSourceIds));

			redirectToOnboardingDestination();
		}
	}, [isLoggedInAndPermitted, navigate, onboardingDestinationUrl, permittedAccountSourceIds, signOutAndClearContext]);

	return <Loader />;
};
