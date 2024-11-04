import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Outlet, useLocation, useMatches, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Offcanvas, Row } from 'react-bootstrap';
import { CareResourceLocationModel } from '@/lib/models';
//import { careResourceService } from '@/lib/services';
//import useHandleError from '@/hooks/use-handle-error';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { MhicFullscreenBar, MhicPageHeader } from '@/components/integrated-care/mhic';
import InputHelperSearch from '@/components/input-helper-search';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
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

	const [searchParams, setSearchParams] = useSearchParams();
	//const searchQuery = useMemo(() => searchParams.get('searchQuery') ?? '', [searchParams]);
	const orderBy = useMemo(() => searchParams.get('orderBy') ?? '', [searchParams]);

	//const handleError = useHandleError();
	const [isLoading] = useState(false);
	const [careResourceLocations] = useState<CareResourceLocationModel[]>([]);

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');

	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		try {
	// 			setIsLoading(true);

	// 			const response = await careResourceService
	// 				.getCareResourceLocations({
	// 					...(searchQuery && { searchQuery }),
	// 					...(orderBy && { orderBy: orderBy as 'NAME_ASC' }),
	// 				})
	// 				.fetch();

	// 			setCareResources(response.careResourceLocations);
	// 			setCareResourcesTotalCount(response.totalCount);
	// 			setCareResourcesTotalCountDescription(response.totalCountDescription);
	// 		} catch (error) {
	// 			handleError(error);
	// 		} finally {
	// 			setIsLoading(false);
	// 		}
	// 	};

	// 	fetchData();
	// }, [handleError, pageNumber, pageSize, searchQuery, sortBy, sortDirection]);

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
				<title>Cobalt | Integrated Care - Available Resources</title>
			</Helmet>

			{/* path matching logic in mhic-header.tsx hides the default header */}
			<MhicFullscreenBar showExitButton title="Resource search for {Patient Name}" />

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader title="Available Resources">
							<Form onSubmit={handleSearchFormSubmit}>
								<InputHelperSearch
									ref={searchInputRef}
									placeholder="Search name"
									value={searchInputValue}
									onChange={({ currentTarget }) => {
										setSearchInputValue(currentTarget.value);
									}}
									onClear={clearSearch}
								/>
							</Form>
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
										sortDirection={orderBy.split('_')[1] as SORT_DIRECTION}
										onSort={(sortDirection) => {
											searchParams.set('pageNumber', '0');
											searchParams.set('orderBy', `NAME_${sortDirection}`);
											setSearchParams(searchParams, { replace: true });
										}}
									>
										Resource Name
									</TableCell>
									<TableCell header>Insurance</TableCell>
									<TableCell header>Specialties</TableCell>
									<TableCell header>Distance from zip</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{careResourceLocations.map((careResourceLocation) => (
									<TableRow key={careResourceLocation.careResourceLocationId}>
										<TableCell>
											<Link
												to={`${location.pathname}/${careResourceLocation.careResourceLocationId}`}
											>
												{careResourceLocation.name}
											</Link>
										</TableCell>
										<TableCell>
											{careResourceLocation.payors.map((p) => p.name).join(', ')}
										</TableCell>
										<TableCell>
											{careResourceLocation.specialties.map((p) => p.name).join(', ')}
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-start">
											5 miles
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-end">
											<Button variant="outline-primary" className="p-2 me-2">
												Add
											</Button>
										</TableCell>
									</TableRow>
								))}
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
