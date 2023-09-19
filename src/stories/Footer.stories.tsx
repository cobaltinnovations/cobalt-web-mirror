import Footer from '@/components/footer';
import accountJSON from '@/fixtures/account.json';
import { UserExperienceTypeId } from '@/lib/models';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { reactRouterParameters } from 'storybook-addon-react-router-v6';

const meta: Meta<typeof Footer> = {
	title: 'Footer',
	component: Footer,
	tags: ['autodocs'],
	argTypes: {},
	decorators: [
		(Story) => {
			return (
				<div style={{ minHeight: 600 }}>
					<Story />
				</div>
			);
		},
	],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const AuthenticatedFeaturesEnabled: Story = {
	render: (args) => {
		return <Footer {...args} />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						accountResponse: {
							account: accountJSON,
						},
						institutionResponse: {
							institution: {
								featuresEnabled: true,
								features: [
									{
										featureId: 'THERAPY',
										urlName: '/connect-with-support/therapy',
										name: 'Therapy',
										description:
											"If you'd like to talk to a therapist, you can schedule with your Employee Assistance Program (EAP) or the TEAM Clinic. EAP offers 8 free and confidential counseling sessions and visits are not documented in electronic medical records (EMR). TEAM Clinic is based in Cobalt Psychiatry and diagnoses and treats patients as part of a 4-month long, outpatient program. TEAM clinic bills insurance for your visits.",
										navDescription:
											'Connect to a therapist through your Employee Assistance Program or TEAM Clinic',
										navVisible: true,
										landingPageVisible: true,
										recommended: false,
										navigationHeaderId: 'CONNECT_WITH_SUPPORT',
										supportRoleIds: ['CLINICIAN'],
										locationPromptRequired: true,
									},
									{
										featureId: 'MEDICATION_PRESCRIBER',
										urlName: '/connect-with-support/medication-prescriber',
										name: 'Medication Prescriber',
										description:
											'If you’re looking to find a provider to discuss medication options to address mental health symptoms, please connect with the TEAM Clinic. Based in Cobalt Psychiatry, the Time Efficient, Accessible, Multidisciplinary (TEAM) Clinic uses an evidence-based and collaborative approach to diagnose and treat mental health conditions as part of a 4-month long, outpatient program.',
										navDescription:
											'Discuss medication prescription options through the TEAM Clinic',
										navVisible: true,
										landingPageVisible: true,
										recommended: false,
										navigationHeaderId: 'CONNECT_WITH_SUPPORT',
										supportRoleIds: [],
										locationPromptRequired: false,
									},
									{
										featureId: 'GROUP_SESSIONS',
										urlName: '/group-sessions',
										name: 'Group Sessions',
										description:
											'Virtual sessions led by experts and designed to foster connection and provide support for people experiencing similar issues or concerns. Topics range from managing anxiety to healthy living and mindfulness.',
										navDescription: 'Register for topical group sessions led by experts',
										navVisible: true,
										landingPageVisible: true,
										recommended: false,
										navigationHeaderId: 'CONNECT_WITH_SUPPORT',
										supportRoleIds: [],
										locationPromptRequired: false,
									},
								],
							},
						},
					}),
				},
			],
		}),
	},
	args: {},
};

export const Authenticated: Story = {
	render: (args) => {
		return <Footer {...args} />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						accountResponse: {
							account: accountJSON,
						},
						institutionResponse: {
							institution: {},
						},
					}),
				},
			],
		}),
	},
	args: {},
};

export const AuthenticatedExternalContactUs: Story = {
	render: (args) => {
		return <Footer {...args} />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						accountResponse: {
							account: accountJSON,
						},
						institutionResponse: {
							institution: {
								externalContactUsUrl: 'https://www.cobaltinnovations.org/',
							},
						},
					}),
				},
			],
		}),
	},
	args: {},
};

export const AuthenticatedICPatient: Story = {
	render: (args) => {
		return <Footer {...args} />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						accountResponse: {
							account: accountJSON,
						},
						institutionResponse: {
							institution: {
								integratedCareEnabled: true,
								userExperienceTypeId: UserExperienceTypeId.PATIENT,
							},
						},
					}),
				},
			],
		}),
	},
	args: {},
};

export const Unauthenticated: Story = {
	render: (args) => {
		return <Footer {...args} />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						institutionResponse: {
							institution: {},
						},
					}),
				},
			],
		}),
	},
	args: {},
};
