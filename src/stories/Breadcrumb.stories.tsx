import Breadcrumb from '@/components/breadcrumb';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof Breadcrumb> = {
	title: 'Breadcrumb',
	component: Breadcrumb,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
	render: (args) => {
		return <Breadcrumb {...args} />;
	},
	args: {
		breadcrumbs: [
			{
				to: '/',
				title: 'Home',
			},
			{
				to: '/connect-with-support',
				title: 'Connect with Support',
			},
			{
				to: '/#',
				title: 'Appointment',
			},
		],
	},
};
