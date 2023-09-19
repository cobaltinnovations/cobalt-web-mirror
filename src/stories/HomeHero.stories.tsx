import HeroContainer from '@/components/hero-container';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof HeroContainer> = {
	title: 'HeroContainer',
	component: HeroContainer,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof HeroContainer>;

export const Default: Story = {
	render: (args) => {
		return <HeroContainer {...args} />;
	},
	args: {
		className: '',
		children: (
			<>
				<p className="fs-large text-center">Any React Content</p>
			</>
		),
	},
};
