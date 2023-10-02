import { MhicFilterDropdown } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicFilterDropdown> = {
	title: 'MhicFilterDropdown',
	component: MhicFilterDropdown,
	argTypes: {
		align: {
			control: {
				type: 'select',
				options: ['start', 'end'],
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicFilterDropdown>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicFilterDropdown {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		align: 'start',
		className: '',
	},
};
