import Team from '@/components/team';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof Team> = {
	title: 'Team',
	component: Team,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Team>;

export const Default: Story = {
	render: (args) => {
		return <Team {...args} />;
	},
	args: {
		teamMembers: [
			{
				institutionTeamMemberId: 'member-id-1',
				institutionId: 'institution-id-1',
				title: 'Title',
				subtitle: 'Subtitle',
				name: 'Member Name',
				imageUrl: 'https://via.placeholder.com/150',
			},
			{
				institutionTeamMemberId: 'member-id-2',
				institutionId: 'institution-id-1',
				title: 'Title',
				subtitle: 'Subtitle',
				name: 'Member Name',
				imageUrl: 'https://via.placeholder.com/150',
			},
			{
				institutionTeamMemberId: 'member-id-3',
				institutionId: 'institution-id-1',
				title: 'Title',
				subtitle: 'Subtitle',
				name: 'Member Name',
				imageUrl: 'https://via.placeholder.com/150',
			},
		],
	},
};
