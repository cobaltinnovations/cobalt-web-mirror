import React, { useMemo } from 'react';
import InlineAlert from './inline-alert';
import { useNavigate } from 'react-router-dom';
import useAccount from '@/hooks/use-account';
import { FeatureId } from '@/lib/models';

export const PsychiatristRecommendation = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();

	const feature = useMemo(() => {
		return institution.features.find((f) => f.featureId === FeatureId.PSYCHIATRIST);
	}, [institution.features]);

	if (!feature) {
		throw new Error('Showing psychiatrist recommendation when feature is not enabled.');
	}

	return (
		<InlineAlert
			className="mb-4"
			variant="attention"
			title="Medication"
			description="If you are interested in a medication evaluation or medication management you must schedule with our psychiatrist."
			action={{
				title: 'Schedule with Psychiatrist',
				onClick: () => {
					navigate(feature.urlName);
				},
			}}
		/>
	);
};
