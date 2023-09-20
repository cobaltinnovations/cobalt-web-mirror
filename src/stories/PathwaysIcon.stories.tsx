import PathwaysIcon from '@/components/pathways-icons';
import { FeatureId } from '@/lib/models';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof PathwaysIcon> = {
	title: 'PathwaysIcon',
	component: PathwaysIcon,
	tags: ['autodocs'],
	argTypes: {
		featureId: {
			control: { type: 'select' },
			options: Object.keys(FeatureId),
		},
	},
};

export default meta;

type Story = StoryObj<typeof PathwaysIcon>;

export const Default: Story = {
	render: (args) => {
		return <PathwaysIcon {...args} />;
	},
	args: {
		featureId: FeatureId.COACHING,
	},
};
