import GroupSessionsRequestFooter from '@/components/group-sessions-request-footer';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { reactRouterParameters } from 'storybook-addon-react-router-v6';

const meta: Meta<typeof GroupSessionsRequestFooter> = {
	title: 'GroupSessionsRequestFooter',
	component: GroupSessionsRequestFooter,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GroupSessionsRequestFooter>;

export const Default: Story = {
	render: () => {
		return <GroupSessionsRequestFooter />;
	},
	parameters: {
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({
						institutionResponse: {
							institution: {
								groupSessionRequestsEnabled: true,
							},
						},
					}),
				},
			],
		}),
	},
	args: {},
};
