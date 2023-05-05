import Cookies from 'js-cookie';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';

export async function immediateSupportLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	let routedSupportRoleId = url.searchParams.get('supportRoleId');

	if (routedSupportRoleId === 'therapist') {
		routedSupportRoleId = 'clinician';
	}

	const nextParams = new URLSearchParams(url.search);

	if (routedSupportRoleId) {
		nextParams.set('supportRoleId', routedSupportRoleId.toUpperCase());
	}

	nextParams.set('immediateAccess', 'true');

	const searchString = nextParams.toString();
	const authRedirectUrl = `/connect-with-support?${searchString}`;

	if (!Cookies.get('accountId')) {
		Cookies.set('authRedirectUrl', authRedirectUrl);
	}

	redirect('/connect-with-support?' + nextParams.toString());
}
