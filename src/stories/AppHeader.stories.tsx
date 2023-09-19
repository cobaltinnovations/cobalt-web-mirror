import { AppHeader } from '@/app-default-layout';
import accountJSON from '@/fixtures/account.json';
import featuresJSON from '@/fixtures/features.json';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { reactRouterParameters } from 'storybook-addon-react-router-v6';

const meta: Meta<typeof AppHeader> = {
	title: 'AppHeader',
	component: AppHeader,
	tags: ['autodocs'],
	argTypes: {
		unauthenticated: {
			control: { type: 'boolean' },
		},
	},
};

export default meta;

type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 500 }}>
				<AppHeader {...args} />
			</div>
		);
	},
	args: {
		unauthenticated: true,
	},
};

export const FeaturesEnabled: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 500 }}>
				<AppHeader {...args} />
			</div>
		);
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
								alerts: [],
							},
						},
					}),
				},
			],
		}),
	},
	args: {
		unauthenticated: false,
	},
};
