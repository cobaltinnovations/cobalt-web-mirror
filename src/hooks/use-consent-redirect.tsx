import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAccount from './use-account';

function useConsentRedirect() {
	const { institution, account } = useAccount();
	const navigate = useNavigate();
	const location = useLocation();

	const requireConsent = account && !account.consentFormAccepted;
	useEffect(() => {
		if (location.pathname.startsWith('/consent')) {
			return;
		} else if (institution?.requireConsentForm && requireConsent) {
			let destinationUrl = location.pathname + location.search;

			navigate(
				{
					pathname: '/consent',
					search: new URLSearchParams({ destinationUrl }).toString(),
				},
				{ replace: true }
			);
		}
	}, [institution?.requireConsentForm, location.pathname, location.search, navigate, requireConsent]);
}

export default useConsentRedirect;
