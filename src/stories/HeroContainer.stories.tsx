import HomeHero from '@/components/home-hero';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof HomeHero> = {
	title: 'HomeHero',
	component: HomeHero,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof HomeHero>;

export const Default: Story = {
	render: () => {
		return <HomeHero />;
	},
};
