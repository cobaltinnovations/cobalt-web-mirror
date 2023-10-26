import FilterDropdown from '@/components/filter-dropdown';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import useHandleError from '@/hooks/use-handle-error';
import { ContentTypeId } from '@/lib/models';
import { AdminContentListResponse, ContentFiltersResponse, adminService } from '@/lib/services';
import classNames from 'classnames';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Await, LoaderFunctionArgs, defer, useNavigate, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import InputHelperSearch from '@/components/input-helper-search';
import useDebouncedState from '@/hooks/use-debounced-state';

interface AdminResourcesLoaderData {
	resourcesPromise: Promise<[ContentFiltersResponse, AdminContentListResponse]>;
}

export function useAdminResourcesLoaderData() {
	return useRouteLoaderData('admin-resources') as AdminResourcesLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const pageNumber = parseInt(url.searchParams.get('pageNumber') ?? '0', 10);
	const contentTypeId = (url.searchParams.get('contentTypeId') ?? undefined) as ContentTypeId | undefined;
	const approvalStatusId = url.searchParams.get('approvalStatusId') ?? undefined;
	const institutionId = url.searchParams.get('institutionId') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;

	const contentFiltersRequest = adminService.fetchMyContentFilters();
	const contentRequest = adminService.fetchMyContent({
		page: pageNumber,
		...(contentTypeId ? { contentTypeId } : {}),
		...(approvalStatusId ? { myApprovalStatusId: approvalStatusId } : {}),
		...(institutionId ? { institutionId } : {}),
		...(search ? { search } : {}),
	});

	request.signal.addEventListener('abort', () => {
		contentFiltersRequest.abort();
		contentRequest.abort();
	});

	const resourcesPromise = Promise.all([contentFiltersRequest.fetch(), contentRequest.fetch()]);

	return defer({
		resourcesPromise,
	});
}

export const Component = () => {
	const { resourcesPromise } = useAdminResourcesLoaderData();
	const navigate = useNavigate();
	const handleError = useHandleError();

	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const [isLoading, setIsLoading] = useState(false);
	const [contentFilters, setContentFilters] = useState<ContentFiltersResponse>();
	const [nextFilters, setNextFilters] = useState<Record<string, string | null>>({});
	const [content, setContent] = useState<AdminContentListResponse>();

	const initialSearchValue = searchParams.get('search');
	const [searchInputValue, setSearchInputValue] = useState(initialSearchValue);
	const searchQuery = useMemo(() => {
		if (typeof searchInputValue === 'string') {
			return searchInputValue;
		}

		return initialSearchValue;
	}, [initialSearchValue, searchInputValue]);
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebouncedState(searchQuery);

	useEffect(() => {
		if (initialSearchValue === debouncedSearchQuery) {
			return;
		}

		if (debouncedSearchQuery) {
			searchParams.set('search', debouncedSearchQuery);
		} else {
			searchParams.delete('search');
		}

		setSearchParams(searchParams);
	}, [debouncedSearchQuery, initialSearchValue, searchParams, setSearchParams]);

	useEffect(() => {
		if (!resourcesPromise) {
			return;
		}

		const loadResources = async () => {
			try {
				setIsLoading(true);
				const [contentFiltersResponse, contentResponse] = await resourcesPromise;

				setContentFilters(contentFiltersResponse);
				setContent(contentResponse);
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadResources();
	}, [resourcesPromise, handleError]);

	const handlePaginationClick = (pageIndex: number) => {
		searchParams.set('pageNumber', String(pageIndex));
		setSearchParams(searchParams);
	};

	const filters = [
		{
			name: 'Owner',
			searchParam: 'institutionId',
			initialValue: searchParams.get('institutionId'),
			active: searchParams.get('institutionId') !== null,
			options:
				contentFilters?.institutions?.map((institutionOption) => ({
					label: institutionOption.name,
					value: institutionOption.institutionId,
				})) ?? [],
		},
		{
			name: 'Status',
			searchParam: 'approvalStatusId',
			initialValue: searchParams.get('approvalStatusId'),
			active: searchParams.get('approvalStatusId') !== null,
			options:
				contentFilters?.myApprovalStatuses?.map((approvalStatusOption) => ({
					label: approvalStatusOption.description,
					value: approvalStatusOption.approvalStatusId,
				})) ?? [],
		},
		{
			name: 'Type',
			searchParam: 'contentTypeId',
			initialValue: searchParams.get('contentTypeId'),
			active: searchParams.get('contentTypeId') !== null,
			options:
				contentFilters?.contentTypes?.map((contentTypeOption) => ({
					label: contentTypeOption.description,
					value: contentTypeOption.contentTypeId,
				})) ?? [],
		},
		{
			name: 'Tag',
			searchParam: 'tagId',
			initialValue: searchParams.get('tagId'),
			active: searchParams.get('tagId') !== null,
			options: [],
		},
		{
			name: 'Sharing',
			searchParam: 'sharingStatusId',
			initialValue: searchParams.get('sharingStatusId'),
			active: searchParams.get('sharingStatusId') !== null,
			options: [],
		},
	];

	const contentTotalCount = content?.totalCount ?? 0;

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col lg={6}>
						<h2 className="mb-0">Resources</h2>
					</Col>
					<Col lg={6}>
						<div className="mb-6 d-flex align-items-center justify-content-end">
							<Button
								className="ps-4"
								onClick={() => {
									navigate('/admin/resources/add');
								}}
							>
								<PlusIcon className="me-2" />
								Add Resource
							</Button>
							<InputHelperSearch
								className="ms-2"
								style={{ width: 335 }}
								placeholder="Search"
								value={searchInputValue ?? ''}
								onChange={(event) => {
									setSearchInputValue(event.currentTarget.value);
								}}
								onClear={() => {
									setSearchInputValue('');
									setDebouncedSearchQuery('');
									searchParams.delete('search');
									setSearchParams(searchParams);
								}}
							/>
						</div>
					</Col>

					<Col xs={12}>
						<hr />
					</Col>
				</Row>
				<Row className="mb-6">
					<Col>
						<div className="d-flex align-items-center">
							{filters.map((filterConfig, index) => {
								const isLast = index === filters.length - 1;
								const filterId = 'admin-resources-filter-' + filterConfig.name;

								return (
									<FilterDropdown
										className={classNames({ 'me-2': !isLast })}
										active={filterConfig.active}
										id={filterId}
										title={filterConfig.name}
										dismissText="Clear"
										onDismiss={() => {
											searchParams.delete(filterConfig.searchParam);
											searchParams.delete('pageNumber');
											setSearchParams(searchParams);
										}}
										onHide={() => {
											setNextFilters({
												...nextFilters,
												[filterConfig.searchParam]: searchParams.get(filterConfig.searchParam),
											});
										}}
										confirmText="Apply"
										onConfirm={() => {
											if (nextFilters[filterConfig.searchParam] === null) {
												searchParams.delete(filterConfig.searchParam);
											} else {
												searchParams.set(
													filterConfig.searchParam,
													nextFilters[filterConfig.searchParam] ?? ''
												);
											}

											searchParams.delete('pageNumber');
											setSearchParams(searchParams);
										}}
										width={240}
									>
										{filterConfig.options.map((option) => (
											<Form.Check
												key={option.value}
												type="radio"
												name={filterId}
												id={`${filterId}--${option.value}`}
												label={option.label}
												value={option.value}
												checked={nextFilters[filterConfig.searchParam] === option.value}
												onChange={({ currentTarget }) => {
													setNextFilters({
														...nextFilters,
														[filterConfig.searchParam]: currentTarget.value,
													});
												}}
											/>
										))}
									</FilterDropdown>
								);
							})}
						</div>
					</Col>
					<Col>
						<div className="d-flex">{/* <AdminGroupSessionSort className="ms-auto" /> */}</div>
					</Col>
				</Row>
				<Suspense>
					<Await resolve={resourcesPromise}>
						<Row className="mb-8">
							<Col>
								<Table isLoading={isLoading}>
									<TableHead>
										<TableRow>
											<TableCell header>Content</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{content?.adminContent.map((content) => {
											return (
												<TableRow key={content.contentId}>
													<TableCell>
														<pre>{JSON.stringify(content, null, 2)}</pre>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Col>
						</Row>
						<Row>
							<Col xs={{ span: 4, offset: 4 }}>
								<div className="d-flex justify-content-center align-items-center">
									<TablePagination
										total={contentTotalCount}
										page={parseInt(pageNumber, 10)}
										size={15}
										onClick={handlePaginationClick}
									/>
								</div>
							</Col>
						</Row>
					</Await>
				</Suspense>
			</Container>
		</>
	);
};
