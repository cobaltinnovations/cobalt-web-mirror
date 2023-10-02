import { ScreeningIntro } from '@/components/integrated-care/common';
import patientOrderJSON from '@/fixtures/patient-order.json';
import { PatientOrderModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof ScreeningIntro> = {
	title: 'ICScreeningIntro',
	component: ScreeningIntro,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ScreeningIntro>;

export const Default: Story = {
	render: (args) => {
		return <ScreeningIntro {...args} />;
	},
	args: {
		isMhic: false,
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
		onBegin: () => {
			alert('Begin clicked!');
		},
	},
};
