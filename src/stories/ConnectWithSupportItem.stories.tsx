import ConnectWithSupportItem from '@/components/connect-with-support-item';
import providerWithAvailabilityJSON from '@/fixtures/provider-with-availability.json';
import { AvailabilityTimeSlot } from '@/lib/models';

import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container } from 'react-bootstrap';

const meta: Meta<typeof ConnectWithSupportItem> = {
	title: 'ConnectWithSupportItem',
	component: ConnectWithSupportItem,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof ConnectWithSupportItem>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<ConnectWithSupportItem {...args} />
			</Container>
		);
	},
	args: {
		providerId: 'provider-fixture-id-1',
		imageUrl: 'https://via.placeholder.com/150',
		title: 'Title',
		subtitle: 'Subtitle',
		descriptionHtml: '<p>Description as HTML</p>',
		buttons: providerWithAvailabilityJSON.times.map((time) => ({
			title: time.timeDescription,
			disabled: time.status !== 'AVAILABLE',
			onClick: () => {
				alert('Timeslot clicked ' + JSON.stringify(time.timeDescription, null, 4));
			},
		})),
		showViewButton: true,
		onModalTimeButtonClick: (sectionDate: string, availabilityTimeSlot: AvailabilityTimeSlot) => {
			alert(`clicked ${sectionDate} -  ${JSON.stringify(availabilityTimeSlot, null, 4)}`);
		},
	},
};

export const PhoneNumberOnly: Story = {
	render: (args) => {
		return (
			<Container>
				<ConnectWithSupportItem {...args} />
			</Container>
		);
	},
	args: {
		providerId: providerWithAvailabilityJSON.providerId,
		imageUrl: providerWithAvailabilityJSON.imageUrl,
		title: 'Title',
		subtitle: 'Subtitle',
		descriptionHtml: '<p>Description as HTML</p>',
		buttons: [
			{
				as: 'a',
				className: 'text-decoration-none',
				href: `tel:2151231234`,
				title: `Call (215) 123-1234`,
				onClick: () => {
					alert('Phone clicked');
				},
			},
		],
		showViewButton: false,
	},
};
