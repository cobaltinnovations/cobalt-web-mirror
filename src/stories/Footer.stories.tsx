import Footer from '@/components/footer';
import accountJSON from '@/fixtures/account.json';
import featuresJSON from '@/fixtures/features.json';
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
								features: featuresJSON,
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
