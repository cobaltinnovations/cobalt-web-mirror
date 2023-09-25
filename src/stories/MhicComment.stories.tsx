import { MhicComment } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicComment> = {
	title: 'MhicComment',
	component: MhicComment,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicComment>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicComment {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		name: 'Demo Name',
		date: 'September 25, 2023, 10:01 AM',
		tag: 'Tag Text',
		message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.',
		onEdit: () => {
			alert('Edit Clicked');
		},
		onDelete: () => {
			alert('Delete Clicked');
		},
		disabled: false,
		className: '',
	},
};
