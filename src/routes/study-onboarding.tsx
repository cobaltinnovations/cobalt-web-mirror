import Loader from '@/components/loader';
import useAccount from '@/hooks/use-account';
import { studyService } from '@/lib/services';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { LoaderFunctionArgs, useNavigate, useRouteLoaderData } from 'react-router-dom';

function useStudyOnboardingLoaderData() {
	return useRouteLoaderData('study-onboarding') as Awaited<ReturnType<typeof loader>>;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const urlName = params.studyIdOrUrlName as string;

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
	const { permittedAccountSourceIds, onboardingDestinationUrl } = useStudyOnboardingLoaderData();

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
