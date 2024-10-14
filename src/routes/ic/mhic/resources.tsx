import { MhicPageHeader } from '@/components/integrated-care/mhic';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import React from 'react';
import { Badge, Button, Col, Container, Dropdown, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';

export const loader = async () => {
	return null;
};

export const Component = () => {
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
										return;
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
									<TableCell>Resource Name</TableCell>
									<TableCell>Psychiatry</TableCell>
									<TableCell>19444, 19428</TableCell>
									<TableCell className="flex-row align-items-center justify-content-start">
										<Badge pill bg="outline-success">
											Available
										</Badge>
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-end">
										<Button variant="light" className="p-2 me-2">
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
								<TableRow>
									<TableCell>Resource Name</TableCell>
									<TableCell>Psychiatry, Psychotherapy</TableCell>
									<TableCell>19444, 19428</TableCell>
									<TableCell className="flex-row align-items-center justify-content-start">
										<Badge pill bg="outline-danger">
											Unavailable
										</Badge>
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-end">
										<Button variant="light" className="p-2 me-2">
											<CopyIcon className="d-flex" width={20} height={20} />
										</Button>
										<Dropdown>
											<Dropdown.Toggle
												as={DropdownToggle}
												id={`mhic-resources__dropdown-menu--${'resource-1'}`}
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
		</>
	);
};
