import { MhicOutreachModal } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import referenceDataJSON from '@/fixtures/reference-data.json';
import { PatientOrderOutreachResult, PatientOrderOutreachTypeId } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicOutreachModal> = {
	title: 'MhicOutreachModal',
	component: MhicOutreachModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicOutreachModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicOutreachModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		patientOrderId: patientOrderJSON.patientOrderId,
		patientOrderOutreachTypeId: PatientOrderOutreachTypeId.MYCHART_MESSAGE,
		patientOrderOutreachResults:
			referenceDataJSON.patientOrderOutreachResults as unknown as PatientOrderOutreachResult[],
		// outreachToEdit?: PatientOrderOutreachModel
		onSave: () => {
			// save
		},
	},
};
