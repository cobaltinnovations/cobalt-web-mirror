import { MhicFilterPractice } from '@/components/integrated-care/mhic';
import referenceDataJSON from '@/fixtures/reference-data.json';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ReferenceDataResponse } from '@/lib/models';

const meta: Meta<typeof MhicFilterPractice> = {
	title: 'MhicFilterPractice',
	component: MhicFilterPractice,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicFilterPractice>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicFilterPractice {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		referenceData: referenceDataJSON as unknown as ReferenceDataResponse,
		className: '',
	},
};
