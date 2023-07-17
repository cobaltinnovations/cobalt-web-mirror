import React from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { HEADER_HEIGHT } from '@/components/header-v2';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const baseSpacerSize = 4;
const containerPaddingMultiplier = 16;
const containerTopPadding = containerPaddingMultiplier * baseSpacerSize;

const useStyles = createUseThemedStyles((theme) => ({
	imageOuter: {
		borderRadius: 4,
		overflow: 'hidden',
		paddingBottom: '55%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n500,
	},
	schedulingOuter: {
		borderRadius: 8,
		position: 'sticky',
		padding: '32px 24px',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
		top: HEADER_HEIGHT + containerTopPadding,
		[mediaQueries.lg]: {
			top: 'auto',
			borderRadius: 0,
			boxShadow: 'none',
			position: 'static',
			padding: '32px 0 40px',
			borderTop: `1px solid ${theme.colors.n100}`,
		},
	},
}));

export const loader = async () => {
	return null;
};

export const Component = () => {
	const classes = useStyles();

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Session - Internal</title>
			</Helmet>
			<Container className="pb-0 pt-8 py-lg-16" fluid="lg">
				<Row>
					<Col lg={7} className="mb-6 mb-lg-0">
						<Container className="p-lg-0">
							<Row className="mb-8 mb-lg-11">
								<Col>
									<div
										className={classes.imageOuter}
										style={{ backgroundImage: `url(${'https://placehold.co/1696x944'})` }}
									/>
								</Col>
							</Row>
							<Row>
								<Col>
									<h2 className="mb-2 mb-lg-3">Praesent Sollicitudin Lacus</h2>
									<p className="mb-6 text-muted">with Provider, Psy.D.</p>
									<p className="mb-6 mb-lg-10 fs-large">
										Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dignissim,
										nulla quis lacinia molestie, dui arcu pharetra eros, vel vehicula est libero sit
										amet felis. Integer tempor erat sapien. Nam ac lacus quis massa cursus egestas.
										Vestibulum finibus, nunc nec finibus dictum, leo turpis feugiat ex, ut
										sollicitudin est ligula id lectus. Phasellus ut mi a massa venenatis tempus ac
										in leo. Curabitur vitae semper erat. Curabitur ut condimentum tellus.
										Pellentesque quis tortor at augue vehicula fermentum. Etiam finibus sem
										dignissim ex hendrerit sollicitudin.
									</p>
									<div className="d-flex flex-wrap">
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
										<Badge pill bg="outline-dark" className="mb-2 me-2 fs-default text-nowrap">
											Tag Text
										</Badge>
									</div>
								</Col>
							</Row>
						</Container>
					</Col>
					<Col lg={5}>
						<Container fluid className={classes.schedulingOuter}>
							<Container className="p-lg-0">
								<Row className="mb-6">
									<Col>
										<p className="mb-1 fw-bold">Oct 27, 2023</p>
										<p className="mb-0">2:00PM - 12:20PM</p>
									</Col>
								</Row>
								<Row className="mb-6">
									<Col>
										<p className="mb-1 fw-bold">12 seats left</p>
										<p className="mb-0">50 seats total</p>
									</Col>
								</Row>
								<Row className="mb-8">
									<Col>
										<p className="mb-1 fw-bold">Online Video Call</p>
										<p className="mb-0">Attend this session virtually</p>
									</Col>
								</Row>
								<Row>
									<Col>
										<Button className="mb-3 d-block w-100">Reserve My Seat</Button>
										<Button variant="outline-primary" className="d-block w-100">
											Copy Session Link
										</Button>
									</Col>
								</Row>
							</Container>
						</Container>
					</Col>
				</Row>
			</Container>
		</>
	);
};
