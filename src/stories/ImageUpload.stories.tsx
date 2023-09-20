import ImageUpload from '@/components/image-upload';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof ImageUpload> = {
	title: 'ImageUpload',
	component: ImageUpload,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ImageUpload>;

export const Default: Story = {
	render: (args) => {
		return <ImageUpload {...args} />;
	},
	args: {
		imagePreview: '',
		isUploading: false,
		progress: 0,
		onChange: () => {
			alert('new file selected');
		},
		onRemove: () => {
			alert('file removed');
		},
	},
};
