import React, { useState } from 'react';

import { SupportMentalHealthProvidersShell } from '@/components/support-mhp-shell';
import useAccount from '@/hooks/use-account';

const ConnectWithSupportMentalHealthProviders = () => {
	const { institution } = useAccount();
	const myChartAuthUrlState = useState('');

	return (
		<SupportMentalHealthProvidersShell
			myChartAuthUrlState={myChartAuthUrlState}
			renderFeatureDetail={(featureDetails) => {
				return <p className="mb-0 text-center fs-large">{featureDetails.description}</p>;
			}}
			connectTitle={`Connect to ${institution.myChartName}`}
			connectDescription={`In order to be connected with one of our providers, you will need to sign in to your ${institution.myChartName} account. If you do not have a ${institution.myChartName} account, click Learn More for instructions on how to sign up. If you have any difficulty getting an activation or access code, please contact ${institution.myChartName} technical support at ${institution.techSupportPhoneNumberDescription}.`}
			connectActions={[
				{
					variant: 'primary',
					title: `Connect to ${institution.myChartName}`,
					onClick: () => {
						window.location.href = myChartAuthUrlState[0];
					},
				},
				{
					variant: 'outline-primary',
					title: 'Learn More',
					onClick: () => {
						window.open(institution.myChartInstructionsUrl, '_blank', 'noopener, noreferrer');
					},
				},
			]}
			connectedTitle={`Thank you for connecting to ${institution.myChartName}`}
			connectedDescription={`Next, press the button below to take a brief assessment so we can learn more about how you're feeling.`}
			connectedCta="Take the assessment"
		/>
	);
};

export default ConnectWithSupportMentalHealthProviders;
