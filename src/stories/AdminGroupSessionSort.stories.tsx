import { AdminGroupSessionSort } from '@/components/admin';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof AdminGroupSessionSort> = {
	title: 'AdminGroupSessionSort',
	component: AdminGroupSessionSort,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdminGroupSessionSort>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<AdminGroupSessionSort {...args} />
			</div>
		);
	},
	args: {
		className: '',
	},
};
