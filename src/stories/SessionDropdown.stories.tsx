import SessionDropdown from '@/components/session-dropdown';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import SvgIcon from '@/components/svg-icon';

const meta: Meta<typeof SessionDropdown> = {
	title: 'SessionDropdown',
	component: SessionDropdown,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SessionDropdown>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<p>Used in old admin tables</p>

				<SessionDropdown {...args} />
			</div>
		);
	},
	args: {
		id: 'dropdown-1',
		items: [
			{
				icon: <SvgIcon kit="far" icon="home" size={20} />,
				title: 'Action 1',
				onClick: () => {
					alert('Action 1 Clicked');
				},
			},
			{
				icon: <SvgIcon kit="far" icon="home" size={20} />,
				title: 'Action 2',
				onClick: () => {
					alert('Action 2 Clicked');
				},
			},
			{
				icon: <SvgIcon kit="far" icon="home" size={20} />,
				title: 'Action 3',
				onClick: () => {
					alert('Action 3 Clicked');
				},
			},
		],
	},
};
