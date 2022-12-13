import { useLocation } from 'react-router-dom';
import useAccount from './use-account';

function useConsentState() {
	const { institution, account } = useAccount();
	const location = useLocation();

	const showConsentModal =
		location.pathname !== '/privacy' && institution?.requireConsentForm && account && !account.consentFormAccepted;

	return { showConsentModal };
}

export default useConsentState;
