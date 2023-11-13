import { AdminGroupSessionFilterVisibility } from '@/components/admin';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof AdminGroupSessionFilterVisibility> = {
	title: 'AdminGroupSessionFilterVisibility',
	component: AdminGroupSessionFilterVisibility,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AdminGroupSessionFilterVisibility>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<AdminGroupSessionFilterVisibility {...args} />
			</div>
		);
	},
	args: {
		className: '',
	},
};
