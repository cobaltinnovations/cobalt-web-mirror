import React, { useMemo } from 'react';
import InlineAlert from './inline-alert';
import { useNavigate } from 'react-router-dom';
import useAccount from '@/hooks/use-account';
import { FeatureId } from '@/lib/models';

interface PsychiatristRecommendationProps {
	showScheduled?: boolean;
	className?: string;
}

export const PsychiatristRecommendation = ({ showScheduled, className }: PsychiatristRecommendationProps) => {
	const navigate = useNavigate();
	const { institution } = useAccount();

	const feature = useMemo(() => {
		return institution.features.find((f) => f.featureId === FeatureId.PSYCHIATRIST);
	}, [institution.features]);

	if (!feature) {
		throw new Error('Showing psychiatrist recommendation when feature is not enabled.');
	}

	if (showScheduled) {
		return (
			<InlineAlert
				className={className}
				variant="success"
				title="Medication Appointment Scheduled"
				description={`Your appointment with ${feature?.name} has been scheduled. You can manage and access your appointment through ${institution.myChartName} or view the event on Cobalt.`}
				action={[
					{
						title: 'Go to ' + institution.myChartName,
						onClick: () => {
							window.open(institution.myChartDefaultUrl, '_blank', 'noopener, noreferrer');
						},
					},
					{
						title: 'View My Events',
						onClick: () => {
							navigate('/my-calendar');
						},
					},
				]}
			/>
		);
	}

	return (
		<InlineAlert
			className={className}
			variant="attention"
			title="Interested in Medication?"
			description="Based on the symptoms reported, you may be eligible for medication. If you are interested in a medication evaluation or medication management you must schedule with our psychiatrist."
			action={{
				title: 'Schedule with Psychiatrist',
				onClick: () => {
					navigate(feature.urlName);
				},
			}}
		/>
	);
};
