import TabBar from '@/components/tab-bar';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof TabBar> = {
	title: 'TabBar',
	component: TabBar,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TabBar>;

export const Default: Story = {
	render: (args) => {
		return <TabBar {...args} />;
	},
	args: {
		orientation: 'horizontal',
		value: 'tab1',
		tabs: [
			{
				value: 'tab1',
				title: 'Tab One',
				level: 2,
			},
			{
				value: 'tab2',
				title: 'Tab Two',
				level: 2,
			},
			{
				value: 'tab3',
				title: 'Tab Three',
				level: 2,
			},
		],
		onTabClick: (ev) => {
			alert('Tab Clicked ' + ev);
		},
		hideBorder: false,
		className: '',
		style: {},
	},
};

export const Vertical: Story = {
	render: (args) => {
		return <TabBar {...args} />;
	},
	args: {
		orientation: 'vertical',
		value: 'tab1',
		tabs: [
			{
				value: 'tab1',
				title: 'Tab One',
				level: 2,
			},
			{
				value: 'tab2',
				title: 'Tab Two',
				level: 2,
			},
			{
				value: 'tab3',
				title: 'Tab Three',
				level: 2,
			},
		],
		onTabClick: (ev) => {
			alert('Tab Clicked ' + ev);
		},
		hideBorder: false,
		className: '',
		style: {},
	},
};
