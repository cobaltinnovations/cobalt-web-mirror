import useHandleError from '@/hooks/use-handle-error';
import { integratedCareService, PanelAccountsResponse } from '@/lib/services';
import { useCallback, useState } from 'react';

const useFetchPanelAccounts = () => {
	const handleError = useHandleError();
	const [isLoadingPanelAccounts, setIsLoadingPanelAccounts] = useState(false);

	const [response, setResponse] = useState<PanelAccountsResponse>();

	const fetchPanelAccounts = useCallback(async () => {
		try {
			setIsLoadingPanelAccounts(true);

			const apiResponse = await integratedCareService.getPanelAccounts().fetch();

			setResponse(apiResponse);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoadingPanelAccounts(false);
		}
	}, [handleError, setResponse]);

	return {
		isLoadingPanelAccounts,
		fetchPanelAccounts,
		...response,
	};
};

export default useFetchPanelAccounts;
