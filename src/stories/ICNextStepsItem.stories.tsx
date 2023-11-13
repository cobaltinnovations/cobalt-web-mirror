import { NextStepsItem } from '@/components/integrated-care/patient';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof NextStepsItem> = {
	title: 'NextStepsItem',
	component: NextStepsItem,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NextStepsItem>;

export const Default: Story = {
	render: (args) => {
		return <NextStepsItem {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		title: 'Next Step Title',
		description:
			'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		complete: false,
	},
};

export const WithAction: Story = {
	render: (args) => {
		return <NextStepsItem {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		title: 'Next Step Title',
		description:
			'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		complete: false,
		button: {
			title: 'Action Btn',
			onClick: () => {
				alert('Action Btn Clicked');
			},
		},
	},
};
