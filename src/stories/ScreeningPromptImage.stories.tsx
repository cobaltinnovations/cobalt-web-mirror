import ScreeningPromptImage from '@/components/screening-prompt-image';
import { ScreeningImageId } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof ScreeningPromptImage> = {
	title: 'ScreeningPromptImage',
	component: ScreeningPromptImage,
	tags: ['autodocs'],
	argTypes: {
		screeningImageId: {
			control: { type: 'select' },
			options: Object.values(ScreeningImageId),
		},
	},
};

export default meta;

type Story = StoryObj<typeof ScreeningPromptImage>;

export const Default: Story = {
	render: (args) => {
		return <ScreeningPromptImage {...args} />;
	},
	args: {
		screeningImageId: ScreeningImageId.Appointment,
	},
};
