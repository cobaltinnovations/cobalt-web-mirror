import { AdminGroupSessionFilterScheduling } from '@/components/admin';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof AdminGroupSessionFilterScheduling> = {
	title: 'AdminGroupSessionFilterScheduling',
	component: AdminGroupSessionFilterScheduling,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdminGroupSessionFilterScheduling>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<AdminGroupSessionFilterScheduling {...args} />
			</div>
		);
	},
	args: {
		className: '',
	},
};
