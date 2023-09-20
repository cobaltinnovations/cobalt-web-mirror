import FeatureScreeningCta from '@/components/feature-screening-cta';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { reactRouterParameters } from 'storybook-addon-react-router-v6';

const meta: Meta<typeof FeatureScreeningCta> = {
	title: 'FeatureScreeningCta',
	component: FeatureScreeningCta,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FeatureScreeningCta>;

export const Default: Story = {
	render: (args) => {
		return <FeatureScreeningCta {...args} />;
	},
	args: {
		onStartAssessment: () => {
			alert('Start Assessment Clicked');
		},
	},
};

export const EpicFHIREnabled: Story = {
	render: (args) => {
		return <FeatureScreeningCta {...args} />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						institutionResponse: {
							institution: {
								epicFhirEnabled: true,
								externalContactUsUrl: 'https://cobaltinnovations.org/',
							},
						},
					}),
				},
			],
		}),
	},
	args: {},
};
