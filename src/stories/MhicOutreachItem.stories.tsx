import { ReactComponent as FlagDanger } from '@/assets/icons/flag-danger.svg';
import { ReactComponent as FlagSuccess } from '@/assets/icons/flag-success.svg';
import { ReactComponent as NaIcon } from '@/assets/icons/sentiment-na.svg';
import { MhicOutreachItem, PastScheduledMessageGroupsOrOutreachType } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

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
		icon: <FlagSuccess className="text-success" />,
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
		icon: <FlagDanger className="text-danger" />,
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
		icon: <NaIcon />,
	},
};
