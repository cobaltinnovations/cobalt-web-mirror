import ImageUploadCard from '@/components/image-upload-card';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof ImageUploadCard> = {
	title: 'ImageUploadCard',
	component: ImageUploadCard,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ImageUploadCard>;

export const Default: Story = {
	render: (args) => {
		return <ImageUploadCard {...args} />;
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
