import { ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { useState, useEffect } from 'react';

export const useIcReferenceData = () => {
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	useEffect(() => {
		const refDataRequest = integratedCareService.getReferenceData();

		refDataRequest.fetch().then((referenceDataResponse) => {
			setReferenceData(referenceDataResponse);
		});

		return () => {
			refDataRequest.abort();
		};
	}, []);

	return {
		...referenceData,
	};
};
