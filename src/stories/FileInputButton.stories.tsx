import FileInputButton from '@/components/file-input-button';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { ReactComponent as UploadIcon } from '@/assets/icons/icon-upload.svg';

const meta: Meta<typeof FileInputButton> = {
	title: 'FileInputButton',
	component: FileInputButton,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FileInputButton>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<FileInputButton {...args}>
					<Button as="div" variant="outline-primary" className="d-flex align-items-center">
						<UploadIcon className="me-2" />
						Import CSV
					</Button>
				</FileInputButton>
			</Container>
		);
	},
	args: {
		accept: '.csv',
		className: 'me-2',
		onChange: () => {
			alert('File Input Changed');
		},
		disabled: false,
	},
};
