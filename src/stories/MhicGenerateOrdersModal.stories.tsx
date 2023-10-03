import { MhicGenerateOrdersModal } from '@/components/integrated-care/mhic';
import patientOrderNoteJSON from '@/fixtures/patient-order-note.json';
import { PatientOrderNoteModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicGenerateOrdersModal> = {
	title: 'MhicGenerateOrdersModal',
	component: MhicGenerateOrdersModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicGenerateOrdersModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicGenerateOrdersModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
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
