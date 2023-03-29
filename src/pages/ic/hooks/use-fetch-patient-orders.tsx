import useHandleError from '@/hooks/use-handle-error';
import { integratedCareService, PatientOrderResponse } from '@/lib/services';
import { useCallback, useState } from 'react';

const useFetchPatientOrders = () => {
	const handleError = useHandleError();
	const [isLoadingOrders, setIsLoadingOrders] = useState(false);

	const [response, setResponse] = useState<PatientOrderResponse>();

	const fetchPatientOrders = useCallback(
		async (queryParams: Parameters<typeof integratedCareService.getPatientOrders>[0]) => {
			try {
				setIsLoadingOrders(true);

				const apiResponse = await integratedCareService
					.getPatientOrders({
						...queryParams,
						pageSize: '15',
					})
					.fetch();

				setResponse(apiResponse);
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoadingOrders(false);
			}
		},
		[handleError, setResponse]
	);

	const { findResult, ...rest } = response || {};

	return {
		fetchPatientOrders,
		isLoadingOrders,
		...response?.findResult,
		...rest,
	};
};

export default useFetchPatientOrders;
