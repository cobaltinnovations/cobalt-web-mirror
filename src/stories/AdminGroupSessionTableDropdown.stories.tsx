import { GroupSessionTableDropdown } from '@/components/admin';
import groupSessionJSON from '@/fixtures/group-session.json';
import { GroupSessionModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof GroupSessionTableDropdown> = {
	title: 'GroupSessionTableDropdown',
	component: GroupSessionTableDropdown,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GroupSessionTableDropdown>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<GroupSessionTableDropdown {...args} />
			</div>
		);
	},
	args: {
		groupSession: groupSessionJSON as GroupSessionModel,
		onCancel: () => {
			alert('Cancel Clicked');
		},
		onDelete: () => {
			alert('Delete Clicked');
		},
	},
};
