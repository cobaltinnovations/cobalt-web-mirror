import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Badge, Button, Col, Container, Dropdown, Row } from 'react-bootstrap';
import { CareResourceModel } from '@/lib/models';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { MhicPageHeader } from '@/components/integrated-care/mhic';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';
import NoData from '@/components/no-data';

export const loader = async () => {
	return null;
};

export const Component = () => {
	const location = useLocation();

	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const sortBy = useMemo(() => searchParams.get('sortBy') ?? '', [searchParams]);
	const sortDirection = useMemo(() => searchParams.get('sortDirection') ?? '', [searchParams]);

	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResources, setCareResources] = useState<CareResourceModel[]>([]);
	const [careResourcesTotalCount, setCareResourcesTotalCount] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				const response = await careResourceService
					.getCareResources({
						pageSize: '15',
						...(pageNumber && { pageNumber }),
						...(sortBy && { sortBy }),
						...(sortDirection && { sortDirection }),
					})
					.fetch();

				setCareResources(response.careResources);
				setCareResourcesTotalCount(response.totalCount);
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [handleError, pageNumber, sortBy, sortDirection]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resources</title>
			</Helmet>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader title="Resources">
							<Button
								className="me-2 d-flex align-items-center"
								variant="primary"
								onClick={() => {
									//TODO: open modal
								}}
							>
								<PlusIcon className="me-2" /> Add Resource
							</Button>
						</MhicPageHeader>
					</Col>
				</Row>
				<Row className="mb-8">
					<Col>
						<Table isLoading={isLoading}>
							<TableHead>
								<TableRow>
									<TableCell
										className="flex-row align-items-center justify-content-start"
										header
										sortable
										sortDirection={sortDirection as SORT_DIRECTION}
										onSort={(sortDirection) => {
											searchParams.set('pageNumber', '0');
											searchParams.set('sortBy', 'NAME');
											searchParams.set('sortDirection', sortDirection);
											setSearchParams(searchParams, { replace: true });
										}}
									>
										Resource Name
									</TableCell>
									<TableCell header>Phone Number</TableCell>
									<TableCell header>Website</TableCell>
									<TableCell header>Locations</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{!isLoading && careResources.length === 0 && (
									<TableRow>
										<TableCell colSpan={5}>
											<NoData className="bg-white border-0" title="No Resources" actions={[]} />
										</TableCell>
									</TableRow>
								)}
								{careResources.map((careResource) => (
									<TableRow key={careResource.careResourceId}>
										<TableCell>
											<Link to={`${location.pathname}/${careResource.careResourceId}`}>
												{careResource.name}
											</Link>
										</TableCell>
										<TableCell>
											{careResource.supportRoles.map((sr) => sr.description).join(', ')}
										</TableCell>
										<TableCell>
											{careResource.careResourceLocations
												.map((crl) => crl.address.postalCode)
												.join(', ')}
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-start">
											<Badge pill bg="outline-success">
												TODO: Available
											</Badge>
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-end">
											<Dropdown>
												<Dropdown.Toggle
													as={DropdownToggle}
													id={`mhic-resources__dropdown-menu--${careResource.careResourceId}`}
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
														className="d-flex align-items-center"
														onClick={() => {
															return;
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
					</Col>
				</Row>
				<Row>
					<Col>
						<div className="d-flex justify-content-center">
							<TablePagination
								total={careResourcesTotalCount}
								page={parseInt(pageNumber, 10)}
								size={15}
								onClick={(pageIndex) => {
									searchParams.set('pageNumber', String(pageIndex));
									setSearchParams(searchParams, { replace: true });
								}}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};
