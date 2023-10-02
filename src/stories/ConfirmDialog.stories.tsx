import ConfirmDialog from '@/components/confirm-dialog';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof ConfirmDialog> = {
	title: 'ConfirmDialog',
	component: ConfirmDialog,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		size: {
			control: {
				type: 'select',
			},
			options: ['sm', 'lg'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<ConfirmDialog
							show={isShowing}
							onHide={() => setIsShowing(false)}
							{...args}
							onSkip={() => {
								setIsShowing(false);
								args.onSkip();
							}}
						/>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		titleText: 'Title Text',
		bodyText: 'Body Text',
		dismissText: 'Dismiss',
		confirmText: 'Confirm',
		detailText: 'Detail Text',
		isConfirming: false,
		onConfirm: () => {
			alert('Confirm clicked');
		},
		destructive: false,
		size: 'lg',
		displayButtonsBlock: false,
	},
};
