import { AdminGroupSessionFilterStatus } from '@/components/admin';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof AdminGroupSessionFilterStatus> = {
	title: 'AdminGroupSessionFilterStatus',
	component: AdminGroupSessionFilterStatus,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdminGroupSessionFilterStatus>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<AdminGroupSessionFilterStatus {...args} />
			</div>
		);
	},
	args: {
		className: '',
	},
};
