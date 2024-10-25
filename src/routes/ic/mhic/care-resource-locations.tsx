import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Outlet, useLocation, useMatches, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Col, Container, Dropdown, Form, Offcanvas, Row } from 'react-bootstrap';
import { CareResourceLocationModel } from '@/lib/models';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { MhicPageHeader } from '@/components/integrated-care/mhic';
import InputHelperSearch from '@/components/input-helper-search';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';

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

	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = useMemo(() => searchParams.get('searchQuery') ?? '', [searchParams]);
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const pageSize = useMemo(() => searchParams.get('pageSize') ?? '15', [searchParams]);
	const sortBy = useMemo(() => searchParams.get('sortBy') ?? '', [searchParams]);
	const sortDirection = useMemo(() => searchParams.get('sortDirection') ?? '', [searchParams]);

	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResources, setCareResources] = useState<CareResourceLocationModel[]>([]);
	const [careResourcesTotalCount, setCareResourcesTotalCount] = useState(0);
	const [careResourcesTotalCountDescription, setCareResourcesTotalCountDescription] = useState('0');

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				const response = await careResourceService
					.getCareResourceLocations({
						...(searchQuery && { searchQuery }),
						...(pageNumber && { pageNumber }),
						...(pageSize && { pageSize }),
						...(sortBy && { sortBy }),
						...(sortDirection && { sortDirection }),
					})
					.fetch();

				setCareResources(response.careResourceLocations);
				setCareResourcesTotalCount(response.totalCount);
				setCareResourcesTotalCountDescription(response.totalCountDescription);
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [handleError, pageNumber, pageSize, searchQuery, sortBy, sortDirection]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		searchParams.delete('pageNumber');
		searchParams.delete('sortBy');
		searchParams.delete('sortDirection');

		if (searchInputValue) {
			searchParams.set('searchQuery', searchInputValue);
		} else {
			searchParams.delete('searchQuery');
		}

		setSearchParams(searchParams, { replace: true });

		if (hasTouchScreen) {
			searchInputRef.current?.blur();
		}
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		searchParams.delete('pageNumber');
		searchParams.delete('sortBy');
		searchParams.delete('sortDirection');
		searchParams.delete('searchQuery');

		setSearchParams(searchParams, { replace: true });

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [hasTouchScreen, searchParams, setSearchParams]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resources</title>
			</Helmet>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader title="Resources">
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
									className="me-2 d-flex align-items-center"
									variant="primary"
									onClick={() => {
										navigate({ pathname: `${location.pathname}/add` });
									}}
								>
									<PlusIcon className="me-2" /> Add
								</Button>
								<Form onSubmit={handleSearchFormSubmit}>
									<InputHelperSearch
										ref={searchInputRef}
										placeholder="Search"
										value={searchInputValue}
										onChange={({ currentTarget }) => {
											setSearchInputValue(currentTarget.value);
										}}
										onClear={clearSearch}
									/>
								</Form>
							</div>
						</MhicPageHeader>
					</Col>
				</Row>
				<Row className="mb-8">
					<Col>
						<hr />
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
										Name
									</TableCell>
									<TableCell header>Therapy Type</TableCell>
									<TableCell header>ZIP</TableCell>
									<TableCell header>Availability</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{careResources.map((careResource) => (
									<TableRow key={careResource.careResourceId}>
										<TableCell>
											<Link to={`${location.pathname}/${careResource.careResourceId}`}>
												{careResource.name}
											</Link>
										</TableCell>
										<TableCell>N/A</TableCell>
										<TableCell>{careResource.address.postalCode}</TableCell>
										<TableCell className="flex-row align-items-center justify-content-start">
											<Badge pill bg="outline-success">
												TODO: Available
											</Badge>
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-end">
											<Button variant="light" className="p-2 me-2">
												<CopyIcon className="d-flex" width={20} height={20} />
											</Button>
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
															navigate({
																pathname: `${location.pathname}/${careResource.careResourceId}/edit`,
															});
														}}
													>
														<EditIcon className="me-2 text-n500" />
														Edit
													</Dropdown.Item>
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
					<Col xs={{ span: 4, offset: 4 }}>
						<div className="d-flex justify-content-center align-items-center">
							<TablePagination
								total={careResourcesTotalCount}
								page={parseInt(pageNumber, 10)}
								size={parseInt(pageSize, 10)}
								onClick={(pageIndex) => {
									searchParams.set('pageNumber', String(pageIndex));
									setSearchParams(searchParams, { replace: true });
								}}
							/>
						</div>
					</Col>
					<Col xs={4}>
						<div className="d-flex justify-content-end align-items-center">
							<p className="mb-0 fw-semibold text-gray">
								<span className="text-dark">{careResources.length}</span> of{' '}
								<span className="text-dark">{careResourcesTotalCountDescription}</span> Care Resources
							</p>
						</div>
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
