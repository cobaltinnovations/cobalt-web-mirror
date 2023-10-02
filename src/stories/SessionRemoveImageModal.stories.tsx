import SessionRemoveImageModal from '@/components/session-remove-image-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof SessionRemoveImageModal> = {
	title: 'SessionRemoveImageModal',
	component: SessionRemoveImageModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SessionRemoveImageModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return <SessionRemoveImageModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		imageSource: 'https://picsum.photos/200/300',
		onRemove: () => {
			alert('Remove');
		},
	},
};
