import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import SessionFormSubmitBanner from '@/components/session-form-submit-banner';

const meta: Meta<typeof SessionFormSubmitBanner> = {
	title: 'SessionFormSubmitBanner',
	component: SessionFormSubmitBanner,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SessionFormSubmitBanner>;

export const Default: Story = {
	render: (args) => {
		return (
			<form
				style={{ minHeight: 300 }}
				onSubmit={(e) => {
					e?.preventDefault();
					alert('Submitted!');
				}}
			>
				<SessionFormSubmitBanner {...args} />
			</form>
		);
	},
	args: {
		title: 'Submit',
		disabled: false,
	},
};
