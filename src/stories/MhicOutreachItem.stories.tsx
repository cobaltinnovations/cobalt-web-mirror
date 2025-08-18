import { MhicOutreachItem, PastScheduledMessageGroupsOrOutreachType } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import SvgIcon from '@/components/svg-icon';

const meta: Meta<typeof MhicOutreachItem> = {
	title: 'MhicOutreachItem',
	component: MhicOutreachItem,
	args: {
		type: PastScheduledMessageGroupsOrOutreachType.OUTREACH,
		name: '{{name}}',
		date: '{{date}}',
		onEditClick: () => {
			alert('Edit Clicked');
		},
		onDeleteClick: () => {
			alert('Delete Clicked');
		},
		title: '{{title}}',
		description: '{{description}}',
		disabled: false,
		className: '',
	},
	argTypes: {
		type: {
			control: { type: 'select' },
			options: PastScheduledMessageGroupsOrOutreachType,
		},
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicOutreachItem>;

export const Success: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 300 }}>
				<div className="border rounded bg-white">
					<MhicOutreachItem {...args} />
				</div>
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		id: 'outreach-success-id',
		icon: <SvgIcon kit="fas" icon="circle-check" size={20} className="text-success" />,
	},
};

export const Error: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 300 }}>
				<div className="border rounded bg-white">
					<MhicOutreachItem {...args} />
				</div>
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		id: 'outreach-erro-id',
		icon: <SvgIcon kit="fas" icon="diamond-exclamation" size={20} className="text-danger" />,
	},
};

export const NA: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 300 }}>
				<div className="border rounded bg-white">
					<MhicOutreachItem {...args} />
				</div>
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		id: 'outreach-na-id',
		icon: <SvgIcon kit="far" icon="face-meh" />,
	},
};
