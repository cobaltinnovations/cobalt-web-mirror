import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
	Link,
	LoaderFunctionArgs,
	Outlet,
	useLoaderData,
	useMatches,
	useNavigate,
	useRevalidator,
} from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Dropdown, Offcanvas, Row } from 'react-bootstrap';
import { careResourceService } from '@/lib/services';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { MhicCareResourceFormModal } from '@/components/integrated-care/mhic';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import NoData from '@/components/no-data';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';
import ConfirmDialog from '@/components/confirm-dialog';
import { CareResourceLocationModel } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	shelf: {
		width: '95% !important',
		maxWidth: '800px !important',
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.border}`,
		},
	},
}));

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const { careResourceId } = params;
	if (!careResourceId) {
		throw new Error('careResourceId is undefined.');
	}

	const networkCall = careResourceService.getCareResource(careResourceId);
	request.signal.addEventListener('abort', () => {
		networkCall.abort();
	});

	const { careResource } = await networkCall.fetch();
	return { careResource };
};

export const Component = () => {
	const { careResource } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const classes = useStyles();
	const navigate = useNavigate();
	const matches = useMatches();
	const revalidator = useRevalidator();
	const handleError = useHandleError();
	const [showFormModal, setShowFormModal] = useState(false);
	const [careResourceLocationToDelete, setCareResourceLocationToDelete] = useState<CareResourceLocationModel>();

	const handleDeleteConfirm = useCallback(async () => {
		try {
			if (!careResourceLocationToDelete) {
				throw new Error('careResourceLocationToDelete is undefined.');
			}

			await careResourceService.deleteCareResourceLocation(careResourceLocationToDelete.careResourceId).fetch();
			setCareResourceLocationToDelete(undefined);
			revalidator.revalidate();
		} catch (error) {
			handleError(error);
		}
	}, [careResourceLocationToDelete, handleError, revalidator]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resource - {careResource.name}</title>
			</Helmet>

			<MhicCareResourceFormModal
				careResourceId={careResource.careResourceId}
				show={showFormModal}
				onHide={() => {
					setShowFormModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowFormModal(false);
				}}
			/>

			<ConfirmDialog
				size="lg"
				show={!!careResourceLocationToDelete}
				onHide={() => {
					setCareResourceLocationToDelete(undefined);
				}}
				titleText={'Delete Care Resource Location'}
				bodyText={`Are you sure you want to delete ${careResourceLocationToDelete?.name}?`}
				dismissText="No"
				confirmText="Yes"
				onConfirm={handleDeleteConfirm}
			/>

			<Container>
				<Row className="py-10">
					<Col>
						<Link to="/ic/mhic/admin/resources" className="d-block mb-6">
							Resources
						</Link>
						<h2 className="mb-0">{careResource.name}</h2>
					</Col>
				</Row>
				<Row>
					<Col lg={4}>
						<Card bsPrefix="ic-card">
							<Card.Body className="cobalt-card__body--top d-flex align-items-center justify-content-between">
								<h4>Details</h4>
								<Button
									variant="outline-primary"
									className="d-flex align-items-center"
									onClick={() => {
										setShowFormModal(true);
									}}
								>
									<EditIcon width={20} height={20} className="d-flex me-2" />
									Edit
								</Button>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Contact</Card.Title>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="m-0 text-gray">Phone</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">{careResource.formattedPhoneNumber ?? 'Not provided'}</p>
										</Col>
									</Row>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="m-0 text-gray">Email</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">{careResource.emailAddress ?? 'Not provided'}</p>
										</Col>
									</Row>
									<Row>
										<Col xs={3}>
											<p className="m-0 text-gray">Website</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">{careResource.websiteUrl ?? 'Not provided'}</p>
										</Col>
									</Row>
								</Container>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Accepted Insurance</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="m-0">
									{careResource.payors.length > 0
										? careResource.payors.map((p) => p.name).join(', ')
										: 'Not provided'}
								</p>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Resource Notes</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="m-0">{careResource.notes ?? 'Not provided'}</p>
							</Card.Body>
						</Card>
					</Col>
					<Col lg={8}>
						<Card bsPrefix="ic-card">
							<Card.Body className="cobalt-card__body--top d-flex align-items-center justify-content-between">
								<h4>Locations</h4>
								<Button
									variant="primary"
									className="d-flex align-items-center"
									onClick={() => {
										navigate(`./location/add`);
									}}
								>
									<PlusIcon width={20} height={20} className="d-flex me-2" />
									Add
								</Button>
							</Card.Body>
							<Card.Body className="p-0 border-top bg-n75">
								<Table className="border-0">
									<TableHead>
										<TableRow>
											<TableCell header>Location Name</TableCell>
											<TableCell header>Insurance</TableCell>
											<TableCell header>Specialties</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header />
										</TableRow>
									</TableHead>
									<TableBody>
										{careResource.careResourceLocations.length === 0 && (
											<TableRow>
												<TableCell colSpan={5}>
													<NoData
														className="bg-white border-0"
														title="No Care Resource Locations"
														actions={[]}
													/>
												</TableCell>
											</TableRow>
										)}
										{careResource.careResourceLocations.map((crl) => (
											<TableRow key={crl.careResourceLocationId}>
												<TableCell>
													<span className="d-block text-nowrap">
														<Link
															to={`./location/${crl.careResourceLocationId}`}
															className="text-decoration-none"
														>
															{crl.name}
														</Link>
													</span>
													<span className="d-block text-nowrap">
														{crl.address.streetAddress1}
													</span>
													<span className="d-block text-nowrap">
														{crl.address.locality}, {crl.address.region}{' '}
														{crl.address.postalCode}
													</span>
													{crl.address.streetAddress2 ?? (
														<span className="d-block text-nowrap">
															{crl.address.streetAddress2}
														</span>
													)}
												</TableCell>
												<TableCell>
													{crl.payors.length > 0
														? crl.payors.map((s) => s.name).join(', ')
														: 'Not provided'}
												</TableCell>
												<TableCell>
													{crl.specialties.length > 0
														? crl.specialties.map((s) => s.name).join(', ')
														: 'Not provided'}
												</TableCell>
												<TableCell>
													<div className="d-flex align-items-center justify-content-between">
														{crl.acceptingNewPatients ? (
															<Badge pill bg="outline-success">
																Available
															</Badge>
														) : (
															<Badge pill bg="outline-danger">
																Unavailable
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<Dropdown>
														<Dropdown.Toggle
															as={DropdownToggle}
															id={`mhic-resources__dropdown-menu--${careResource.careResourceId}`}
															className="p-2 border-0"
														>
															<MoreIcon className="d-flex" />
														</Dropdown.Toggle>
														<Dropdown.Menu
															as={DropdownMenu}
															align="end"
															popperConfig={{ strategy: 'fixed' }}
															renderOnMount
														>
															<Dropdown.Item
																className="d-flex align-items-center"
																onClick={() => {
																	navigate(
																		`./location/${crl.careResourceLocationId}/edit`
																	);
																}}
															>
																<EditIcon className="me-2 text-n500" />
																Edit
															</Dropdown.Item>
															<Dropdown.Item
																className="d-flex align-items-center"
																onClick={() => {
																	setCareResourceLocationToDelete(crl);
																}}
															>
																<DeleteIcon className="me-2 text-n500" />
																Delete
															</Dropdown.Item>
														</Dropdown.Menu>
													</Dropdown>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>

			<Offcanvas
				className={classes.shelf}
				show={
					!!matches.find((m) =>
						Object.hasOwn((m.handle as Record<string, any>) ?? {}, 'isMhicResourcesShelf')
					)
				}
				placement="end"
				onHide={() => {
					navigate('.');
				}}
			>
				<Outlet />
			</Offcanvas>
		</>
	);
};
