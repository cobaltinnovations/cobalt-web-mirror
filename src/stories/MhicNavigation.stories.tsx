import { ReactComponent as DotIcon } from '@/assets/icons/icon-dot.svg';
import { MhicNavigation } from '@/components/integrated-care/mhic';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicNavigation> = {
	title: 'MhicNavigation',
	component: MhicNavigation,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicNavigation>;

export const Default: Story = {
	render: (args) => {
		return <MhicNavigation {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		navigationItems: [
			{
				title: 'Title',
				description: '100',
				icon: () => <DotIcon width={24} height={24} className="text-n300" />,
				onClick: () => {
					//
				},
				isActive: false,
			},
			{
				title: 'Title',
				description: '100',
				icon: () => <DotIcon width={24} height={24} className="text-secondary" />,
				onClick: () => {
					//
				},
				isActive: false,
			},
			{
				title: 'Title',
				description: '100',
				icon: () => <DotIcon width={24} height={24} className="text-p100" />,
				onClick: () => {
					//
				},
				isActive: false,
			},
			{
				title: 'Title',
				description: '100',
				icon: () => <DotIcon width={24} height={24} className="text-p300" />,
				onClick: () => {
					//
				},
				isActive: false,
			},
			{
				title: 'Title',
				description: '100',
				icon: () => <DotIcon width={24} height={24} className="text-primary" />,
				onClick: () => {
					//
				},
				isActive: false,
			},
			{
				title: 'Title',
				description: '100',
				icon: () => <DotIcon width={24} height={24} className="text-gray" />,
				onClick: () => {
					//
				},
				isActive: false,
			},
		],
	},
};
