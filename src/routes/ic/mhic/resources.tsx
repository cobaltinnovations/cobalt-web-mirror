import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { Badge, Button, Col, Container, Dropdown, Offcanvas, Row } from 'react-bootstrap';
import { MhicPageHeader } from '@/components/integrated-care/mhic';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
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

export const loader = async () => {
	return null;
};

export const Component = () => {
	const classes = useStyles();
	const location = useLocation();
	const navigate = useNavigate();
	const matches = useMatches();

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resources</title>
			</Helmet>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader className="mb-6" title="Resources">
							<div className="d-flex align-items-center">
								<Button
									className="me-2"
									variant="outline-primary"
									onClick={() => {
										return;
									}}
								>
									Create Packet
								</Button>
								<Button
									className="d-flex align-items-center"
									variant="primary"
									onClick={() => {
										navigate({
											pathname: `${location.pathname}/add`,
											search: location.search,
										});
									}}
								>
									<PlusIcon className="me-2" /> Add
								</Button>
							</div>
						</MhicPageHeader>
						<hr className="mb-6" />
						<div className="d-flex justify-content-between align-items-center">
							<div className="d-flex align-items-center">
								<span>TODO: Filters</span>
							</div>
							<div>
								<span>TODO: Sort</span>
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<Table isLoading={false}>
							<TableHead>
								<TableRow>
									<TableCell header>Name</TableCell>
									<TableCell header>Therapy Type</TableCell>
									<TableCell header>ZIP</TableCell>
									<TableCell header>Availability</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<TableRow>
									<TableCell>
										<Link to={`${location.pathname}/${'xxx'}`}>Resource Name</Link>
									</TableCell>
									<TableCell>Psychiatry</TableCell>
									<TableCell>19444, 19428</TableCell>
									<TableCell className="flex-row align-items-center justify-content-start">
										<Badge pill bg="outline-success">
											Available
										</Badge>
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-end">
										<Button
											variant="light"
											className="p-2 me-2"
											onClick={(event) => {
												event.stopPropagation();
											}}
										>
											<CopyIcon className="d-flex" width={20} height={20} />
										</Button>
										<Dropdown>
											<Dropdown.Toggle
												as={DropdownToggle}
												id={`mhic-resources__dropdown-menu--${'resource-0'}`}
												className="p-2"
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
													onClick={() => {
														return;
													}}
												>
													Action 1
												</Dropdown.Item>
												<Dropdown.Item
													onClick={() => {
														return;
													}}
												>
													Action 2
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
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
					navigate({
						pathname: '.',
						search: location.search,
					});
				}}
			>
				<Outlet />
			</Offcanvas>
		</>
	);
};
