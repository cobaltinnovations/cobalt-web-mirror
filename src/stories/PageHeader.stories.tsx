import PageHeader from '@/components/page-header';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof PageHeader> = {
	title: 'PageHeader',
	component: PageHeader,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: { type: 'text' },
			required: true,
		},
		descriptionHtml: {
			control: { type: 'text' },
		},
		imageUrl: {
			control: { type: 'text' },
		},
		imageAlt: {
			control: { type: 'text' },
		},
		className: {
			control: { type: 'text' },
		},
	},
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const FeaturedTopic: Story = {
	render: (props) => {
		return <PageHeader {...props} />;
	},
	args: {
		title: 'Featured Topic Title',
		descriptionHtml: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque placerat eros in congue accumsan. Vivamus sollicitudin risus velit, aliquet venenatis magna dictum non. Duis viverra nisi condimentum libero ullamcorper, at sodales nunc imperdiet. Suspendisse euismod turpis vitae velit eleifend, eget pharetra ex semper.</p><p>Proin aliquam elit vitae purus eleifend, sed volutpat enim porttitor. Proin sed ullamcorper dui. Aliquam iaculis, enim eget egestas lobortis, leo lorem venenatis augue, in mattis lorem turpis ac urna. Pellentesque vitae posuere velit. Sed dapibus pharetra facilisis. Praesent auctor efficitur rutrum. Vivamus lacus risus, posuere quis elit non, cursus aliquet neque.</p>`,
		imageAlt: 'Featured Topic Image Alt',
		imageUrl: 'https://via.placeholder.com/1600x900',
	},
};
