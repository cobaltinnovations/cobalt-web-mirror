import Loader from '@/components/loader';
import useAccount from '@/hooks/use-account';
import React from 'react';

import { useScreeningFlow } from '../screening/screening.hooks';

const IntegratedCareScreeningPage = () => {
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow(
		institution?.integratedCareScreeningFlowId
	);

	if (!didCheckScreeningSessions) {
		return (
			<>
				{renderedCollectPhoneModal}
				<Loader />
			</>
		);
	}

	return <p>TODO: Show Screening/Booking results</p>;
};

export default IntegratedCareScreeningPage;
