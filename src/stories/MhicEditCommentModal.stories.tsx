import { MhicEditCommentModal } from '@/components/integrated-care/mhic';
import patientOrderNoteJSON from '@/fixtures/patient-order-note.json';
import { PatientOrderNoteModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicEditCommentModal> = {
	title: 'MhicEditCommentModal',
	component: MhicEditCommentModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicEditCommentModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicEditCommentModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		patientOrderNote: patientOrderNoteJSON as unknown as PatientOrderNoteModel,
		onSave() {
			//
		},
	},
};
