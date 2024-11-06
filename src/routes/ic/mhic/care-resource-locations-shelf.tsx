import React, { useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useLocation, useNavigate, useRevalidator } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';
import { careResourceService } from '@/lib/services';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { MhicInternalNotesModal } from '@/components/integrated-care/mhic';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		padding: '28px 32px',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	body: {
		overflowY: 'auto',
		backgroundColor: theme.colors.n50,
	},
	shelfCloseButton: {
		top: 20,
		right: 24,
	},
}));

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { careResourceLocationId } = params;

	if (!careResourceLocationId) {
		throw new Error('careResourceLocationId is undefined.');
	}

	const { careResourceLocation } = await careResourceService.getCareResourceLocation(careResourceLocationId).fetch();
	return { careResourceLocation };
};

export const Component = () => {
	const { careResourceLocation } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const classes = useStyles();
	const location = useLocation();
	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const [showInternalNotesModal, setShowInternalNotesModal] = useState(false);

	return (
		<>
			<MhicInternalNotesModal
				defaultValue={careResourceLocation.internalNotes}
				show={showInternalNotesModal}
				careResourceLocationId={careResourceLocation.careResourceLocationId}
				onHide={() => {
					setShowInternalNotesModal(false);
				}}
				onSave={() => {
					setShowInternalNotesModal(false);
					revalidator.revalidate();
				}}
			/>

			<div className={classes.header}>
				<Button
					variant="light"
					className={classNames(classes.shelfCloseButton, 'p-2 border-0 position-absolute')}
					onClick={() => {
						navigate({
							pathname: '..',
							search: location.search,
						});
					}}
				>
					<CloseIcon width={20} height={20} className="d-block" />
				</Button>
				<div className="mb-2 d-flex align-items-center">
					<h4 className="mb-0 me-2">{careResourceLocation.resourceName}</h4>
					{careResourceLocation.acceptingNewPatients ? (
						<Badge pill bg="outline-success">
							Available
						</Badge>
					) : (
						<Badge pill bg="outline-danger">
							Unavailable
						</Badge>
					)}
				</div>
				<div className="d-flex align-items-center">
					<p className="mb-0">
						<span className="fw-bold">{careResourceLocation.name}</span> | Phone:{' '}
						<span className="fw-bold">{careResourceLocation.formattedPhoneNumber}</span>
					</p>
				</div>
			</div>
			<div className={classes.body}>
				<section>
					<Container fluid>
						<Row>
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Resource Notes</Card.Title>
									</Card.Header>
									<Card.Body>
										<p className="m-0">{careResourceLocation.resourceNotes ?? 'Not provided.'}</p>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					</Container>
				</section>
				<section>
					<Container fluid>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Internal Notes</Card.Title>
										<div className="button-container">
											<Button
												variant="link"
												className="ms-2 p-2 border-0"
												onClick={() => {
													setShowInternalNotesModal(true);
												}}
											>
												<EditIcon className="d-flex" width={20} height={20} />
											</Button>
										</div>
									</Card.Header>
									<Card.Body>
										<p className="m-0">{careResourceLocation.internalNotes ?? 'Not provided.'}</p>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Contact</Card.Title>
									</Card.Header>
									<Card.Body>
										<Container fluid>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Phone</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.formattedPhoneNumber ?? 'Not provided'}
													</p>
												</Col>
											</Row>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Email</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.emailAddress ?? 'Not provided'}
													</p>
												</Col>
											</Row>
											<Row>
												<Col xs={3}>
													<p className="m-0 text-gray">Website</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.websiteUrl ?? 'Not provided'}
													</p>
												</Col>
											</Row>
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Address</Card.Title>
									</Card.Header>
									<Card.Body>
										<Container fluid>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Address</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														<span className="d-block text-nowrap">
															{careResourceLocation.address.streetAddress1}
														</span>
														<span className="d-block text-nowrap">
															{careResourceLocation.address.locality},{' '}
															{careResourceLocation.address.region}{' '}
															{careResourceLocation.address.postalCode}
														</span>
														{careResourceLocation.address.streetAddress2 ?? (
															<span className="d-block text-nowrap">
																{careResourceLocation.address.streetAddress2}
															</span>
														)}
													</p>
												</Col>
											</Row>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Accessibility</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.wheelchairAccess
															? 'Wheelchair accessible'
															: 'Not Wheelchair accessible'}
													</p>
												</Col>
											</Row>
											<Row>
												<Col xs={3}>
													<p className="m-0 text-gray">Facility Type</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.facilityTypes.length > 0
															? careResourceLocation.facilityTypes
																	.map((p) => p.name)
																	.join(', ')
															: 'Not provided'}
													</p>
												</Col>
											</Row>
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Insurance</Card.Title>
									</Card.Header>
									<Card.Body>
										<p className="m-0">
											{careResourceLocation.payors.length > 0
												? careResourceLocation.payors.map((p) => p.name).join(', ')
												: 'Not provided'}
										</p>
										{careResourceLocation.insuranceNotes && (
											<p className="mb-0 mt-4">{careResourceLocation.insuranceNotes}</p>
										)}
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Specialties</Card.Title>
									</Card.Header>
									<Card.Body>
										<p className="m-0">
											{careResourceLocation.specialties.length > 0
												? careResourceLocation.specialties.map((p) => p.name).join(', ')
												: 'Not provided'}
										</p>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Therapy Types</Card.Title>
									</Card.Header>
									<Card.Body>
										<p className="m-0">
											{careResourceLocation.therapyTypes.length > 0
												? careResourceLocation.therapyTypes.map((p) => p.name).join(', ')
												: 'Not provided'}
										</p>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Provider Details</Card.Title>
									</Card.Header>
									<Card.Body>
										<Container fluid>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Genders</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.genders.length > 0
															? careResourceLocation.genders.map((p) => p.name).join(', ')
															: 'Not provided'}
													</p>
												</Col>
											</Row>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Ethnicities</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.ethnicities.length > 0
															? careResourceLocation.ethnicities
																	.map((p) => p.name)
																	.join(', ')
															: 'Not provided'}
													</p>
												</Col>
											</Row>
											<Row>
												<Col xs={3}>
													<p className="m-0 text-gray">Languages</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.languages.length > 0
															? careResourceLocation.languages
																	.map((p) => p.name)
																	.join(', ')
															: 'Not provided'}
													</p>
												</Col>
											</Row>
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row className="mb-6">
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Population Servced</Card.Title>
									</Card.Header>
									<Card.Body>
										<Container fluid>
											<Row>
												<Col xs={3}>
													<p className="m-0 text-gray">Ages</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">
														{careResourceLocation.populationServed.length > 0
															? careResourceLocation.populationServed
																	.map((p) => p.name)
																	.join(', ')
															: 'Not provided'}
													</p>
												</Col>
											</Row>
										</Container>
									</Card.Body>
								</Card>
							</Col>
						</Row>
						<Row>
							<Col>
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>Location Notes</Card.Title>
									</Card.Header>
									<Card.Body>
										<div
											className="mb-0"
											dangerouslySetInnerHTML={{
												__html:
													careResourceLocation.notes ?? '<p class="mb-0">Not provided</p>',
											}}
										/>
									</Card.Body>
								</Card>
							</Col>
						</Row>
					</Container>
				</section>
			</div>
		</>
	);
};
