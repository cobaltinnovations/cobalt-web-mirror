import InstitutionResourceGroupTile from '@/components/institution-resource-group-tile';
import { Institution, InstitutionResourceGroup } from '@/lib/models';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof InstitutionResourceGroupTile> = {
	title: 'InstitutionResourceGroupTile',
	component: InstitutionResourceGroupTile,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof InstitutionResourceGroupTile>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col xs={12} md={6} lg={3}>
						<InstitutionResourceGroupTile {...args} />
					</Col>
					<Col xs={12} md={6} lg={3}>
						<InstitutionResourceGroupTile
							institutionResourceGroup={{
								...args.institutionResourceGroup,
								name: 'No Image',
								imageUrl: undefined,
							}}
						/>
					</Col>
					<Col xs={12} md={6} lg={3}>
						<InstitutionResourceGroupTile {...args} />
					</Col>
					<Col xs={12} md={6} lg={3}>
						<InstitutionResourceGroupTile {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		institutionResourceGroup: {
			institutionResourceGroupId: 'institution-resource-group-fixture-id-1',
			institutionId: 'institution-fixture-id-1',
			name: 'Resource Name',
			urlName: 'res-url-name',
			imageUrl: 'https://via.placeholder.com/300x200',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			backgroundColorValueId: 'P100',
			backgroundColorId: 'BRAND_PRIMARY',
			backgroundColorValueName: 'p100',
			backgroundColorValueCssRepresentation: '#C3D0EB',
			textColorValueId: 'P700',
			textColorId: 'BRAND_PRIMARY',
			textColorValueName: 'p700',
			textColorValueCssRepresentation: '#20406C',
		} as InstitutionResourceGroup,
	},
};
