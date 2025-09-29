import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import HeroContainer from '@/components/hero-container';

import { WELL_BEING_RESOURCES } from '@/well-being-resources';
import useAccount from '@/hooks/use-account';

const WellBeingResources: FC = () => {
	const { institution } = useAccount();
	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Well-Being Resources</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-0 text-center">Well-Being Resources</h2>
			</HeroContainer>
			<Container className="py-10 py-lg-14">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{WELL_BEING_RESOURCES.map((resource, index) => {
							const isLast = WELL_BEING_RESOURCES.length - 1 === index;

							return (
								<React.Fragment key={index}>
									<h4 className="mb-2">
										<a href={resource.href} target="_blank" rel="noreferrer">
											{resource.title}
										</a>
									</h4>
									<div
										className="wysiwyg-display"
										dangerouslySetInnerHTML={{ __html: resource.description }}
									/>
									{!isLast && <hr className="my-8" />}
								</React.Fragment>
							);
						})}
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default WellBeingResources;
