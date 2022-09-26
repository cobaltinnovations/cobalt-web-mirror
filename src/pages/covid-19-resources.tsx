import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import HeroContainer from '@/components/hero-container';

import { COVID_19_RESOURCES } from '@/covid-19-resources';

const Covid19Resources: FC = () => {
	return (
		<>
			<HeroContainer>
				<h2 className="mb-0 text-center">Covid-19 Resources</h2>
			</HeroContainer>
			<Container className="py-10 py-lg-14">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{COVID_19_RESOURCES.map((resource, index) => {
							const isLast = COVID_19_RESOURCES.length - 1 === index;

							return (
								<React.Fragment key={index}>
									<h4 className="mb-2">
										<a href={resource.href} target="_blank" rel="noreferrer">
											{resource.title}
										</a>
									</h4>
									<p>{resource.description}</p>
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

export default Covid19Resources;
