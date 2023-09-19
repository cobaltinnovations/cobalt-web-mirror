import Loader from '@/components/loader';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof Loader> = {
	title: 'Loader',
	component: Loader,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const Default: Story = {
	render: (args) => {
		return (
			<div
				className="position-relative"
				style={{
					minHeight: 400,
				}}
			>
				<Loader {...args} />
			</div>
		);
	},
	args: {
		size: 64,
		className: '',
	},
};
