import SessionCropModal from '@/components/session-crop-modal';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof SessionCropModal> = {
	title: 'SessionCropModal',
	component: SessionCropModal,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SessionCropModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<SessionCropModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />;
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		imageSource: 'https://picsum.photos/200/300',
		onSave: (blob) => {
			//
		},
	},
};
