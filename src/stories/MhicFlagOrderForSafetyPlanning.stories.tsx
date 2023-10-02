import { MhicFlagOrderForSafetyPlanning } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicFlagOrderForSafetyPlanning> = {
	title: 'MhicFlagOrderForSafetyPlanning',
	component: MhicFlagOrderForSafetyPlanning,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicFlagOrderForSafetyPlanning>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicFlagOrderForSafetyPlanning {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		className: '',
	},
};
