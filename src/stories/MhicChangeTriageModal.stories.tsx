import { MhicChangeTriageModal } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import referenceDataJSON from '@/fixtures/reference-data.json';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';
import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';

const meta: Meta<typeof MhicChangeTriageModal> = {
	title: 'MhicChangeTriageModal',
	component: MhicChangeTriageModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicChangeTriageModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicChangeTriageModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
		referenceData: referenceDataJSON as unknown as ReferenceDataResponse,
		onSave: () => {
			//
		},
	},
};
