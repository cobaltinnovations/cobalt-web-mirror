import CallToActionBlock from '@/components/call-to-action-block';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container } from 'react-bootstrap';

const meta: Meta<typeof CallToActionBlock> = {
	title: 'CallToActionBlock',
	component: CallToActionBlock,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof CallToActionBlock>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<CallToActionBlock {...args} />
			</Container>
		);
	},
	args: {
		heading: 'CTA Heading',
		descriptionHtml:
			'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget nibh vitae sapien lacinia dignissim dignissim et nunc.</p>',

		imageUrl: 'https://via.placeholder.com/600x400',
		subheading: 'CTA Subheading',
		primaryActionText: 'Primary Action',
		secondaryActionText: 'Secondary Action',
		onPrimaryActionClick: () => {
			alert('Primary Action Clicked');
		},
		onSecondaryActionClick: () => {
			alert('Secondary Action Clicked');
		},
		className: '',
	},
};
