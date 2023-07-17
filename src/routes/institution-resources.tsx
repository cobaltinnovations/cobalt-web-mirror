import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';
import useAccount from '@/hooks/use-account';
import InstitutionResourceTile from '@/components/institution-resource-tile';

export const loader = async () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>Cobalt | Institution Resources</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">{institution.name} Health Resources</h1>
				<p className="mb-0 text-center fs-large">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Magna aliquam lacus, mattis sem volutpat
					rhoncus massa.
				</p>
			</HeroContainer>

			<Container className="py-16">
				<Row>
					<Col xs={12} md={6} lg={4} className="mb-8">
						<InstitutionResourceTile
							imageUrl="https://placehold.co/800x533"
							to="/#"
							title="Title"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Arcu cras dolor sapien lorem tristique faucibus urna. Tempus lacus"
						/>
					</Col>
					<Col xs={12} md={6} lg={4} className="mb-8">
						<InstitutionResourceTile
							imageUrl="https://placehold.co/800x533"
							to="/#"
							title="Title"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Arcu cras dolor sapien lorem tristique faucibus urna. Tempus lacus"
						/>
					</Col>
					<Col xs={12} md={6} lg={4} className="mb-8">
						<InstitutionResourceTile
							imageUrl="https://placehold.co/800x533"
							to="/#"
							title="Title"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Arcu cras dolor sapien lorem tristique faucibus urna. Tempus lacus"
						/>
					</Col>
					<Col xs={12} md={6} lg={4} className="mb-8">
						<InstitutionResourceTile
							imageUrl="https://placehold.co/800x533"
							to="/#"
							title="Title"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Arcu cras dolor sapien lorem tristique faucibus urna. Tempus lacus"
						/>
					</Col>
					<Col xs={12} md={6} lg={4} className="mb-8">
						<InstitutionResourceTile
							imageUrl="https://placehold.co/800x533"
							to="/#"
							title="Title"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Arcu cras dolor sapien lorem tristique faucibus urna. Tempus lacus"
						/>
					</Col>
					<Col xs={12} md={6} lg={4} className="mb-8">
						<InstitutionResourceTile
							imageUrl="https://placehold.co/800x533"
							to="/#"
							title="Title"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Arcu cras dolor sapien lorem tristique faucibus urna. Tempus lacus"
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
