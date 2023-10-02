import { MhicFilterState } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicFilterState> = {
	title: 'MhicFilterState',
	component: MhicFilterState,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicFilterState>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicFilterState {...args} />
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
