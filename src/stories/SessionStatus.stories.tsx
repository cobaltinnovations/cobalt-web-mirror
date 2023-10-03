import SessionStatus, { SESSION_STATUS } from '@/components/session-status';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof SessionStatus> = {
	title: 'SessionStatus',
	component: SessionStatus,
	tags: ['autodocs'],
	argTypes: {
		status: {
			control: { type: 'select' },
			options: Object.keys(SESSION_STATUS),
		},
	},
};

export default meta;

type Story = StoryObj<typeof SessionStatus>;

export const Default: Story = {
	render: (args) => {
		return <SessionStatus {...args} />;
	},
	args: {
		status: SESSION_STATUS.ADDED,
	},
};
