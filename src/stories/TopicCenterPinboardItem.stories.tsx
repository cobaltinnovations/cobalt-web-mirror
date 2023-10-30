import { TopicCenterPinboardItem } from '@/components/topic-center-pinboard-item';
import topicCenterJSON from '@/fixtures/topic-center.json';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof TopicCenterPinboardItem> = {
	title: 'TopicCenterPinboardItem',
	component: TopicCenterPinboardItem,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TopicCenterPinboardItem>;

export const Default: Story = {
	render: (args) => {
		return <TopicCenterPinboardItem {...args} />;
	},
	args: {
		topicCenter: topicCenterJSON as any,
		topicCenterRow: topicCenterJSON.topicCenterRows[0] as any,
		pinboardNote: topicCenterJSON.topicCenterRows[0].pinboardNotes[1],
		className: '',
	},
};
