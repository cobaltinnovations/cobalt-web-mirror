import { MhicPageHeader } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicPageHeader> = {
	title: 'MhicPageHeader',
	component: MhicPageHeader,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicPageHeader>;

export const Default: Story = {
	render: (args) => {
		return <MhicPageHeader {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		title: `Welcome back, MHIC User!`,
		description: 'Your priorities for today',
	},
};
