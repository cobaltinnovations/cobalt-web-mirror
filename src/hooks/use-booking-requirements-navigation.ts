import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { accountService, institutionService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';

export const useBookingRequirementsNavigation = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { account, institution } = useAccount();

	const checkBookingRequirementsAndRedirect = useCallback(async () => {
		try {
			if (!account?.accountId) {
				throw new Error('accountId is undefined.');
			}

			const { myChartConnectionRequired } = await accountService
				.getBookingRequirements(account.accountId)
				.fetch();

			if (myChartConnectionRequired) {
				if (!institution.institutionId) {
					throw new Error('institutionId is undefined.');
				}

				const { authenticationUrl } = await institutionService
					.getMyChartAuthenticationUrl(institution.institutionId)
					.fetch();

				window.open(authenticationUrl, '_blank', 'noopener, noreferrer');
			} else {
				navigate(`/connect-with-support`);
			}
		} catch (error) {
			handleError(error);
		}
	}, [account?.accountId, handleError, institution.institutionId, navigate]);

	return checkBookingRequirementsAndRedirect;
};
