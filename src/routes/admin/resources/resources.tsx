import FilterDropdown from '@/components/filter-dropdown';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import useHandleError from '@/hooks/use-handle-error';
import { AdminContent, AdminContentAction, ContentStatus, ContentStatusId, ContentTypeId, Tag } from '@/lib/models';
import {
	AdminContentListResponse,
	AdminContentSortOrder,
	ContentFiltersResponse,
	ContentStatusesResponse,
	ContentTagsResponse,
	adminService,
} from '@/lib/services';
import classNames from 'classnames';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Container, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import {
	Await,
	Link,
	LoaderFunctionArgs,
	defer,
	useNavigate,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import InputHelperSearch from '@/components/input-helper-search';
import useDebouncedState from '@/hooks/use-debounced-state';
import { AdminResourcesTableDropdown } from '@/components/admin';
import ContentTypeIcon from '@/components/content-type-icon';
import LoadingButton from '@/components/loading-button';
import { cloneDeep } from 'lodash';

interface AdminResourcesLoaderData {
	resourcesPromise: Promise<
		[ContentTagsResponse, ContentStatusesResponse, ContentFiltersResponse, AdminContentListResponse]
	>;
}

export function useAdminResourcesLoaderData() {
	return useRouteLoaderData('admin-resources') as AdminResourcesLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const page = parseInt(url.searchParams.get('page') ?? '0', 10);
	const institutionId = url.searchParams.get('institutionId') ?? undefined;
	const contentStatusId = (url.searchParams.get('contentStatusId') ?? undefined) as ContentStatusId | undefined;
	const contentTypeId = (url.searchParams.get('contentTypeId') ?? undefined) as ContentTypeId | undefined;
	const tagId = url.searchParams.get('tagId') ?? undefined;
	const sharingOn = url.searchParams.get('sharingOn') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const orderBy = url.searchParams.get('orderBy') ?? undefined;

	const contentTagsResponse = adminService.fetchContentTags();
	const contentStatusesRequest = adminService.fetchContentStatuses();
	const contentFiltersRequest = adminService.fetchMyContentFilters();
	const contentRequest = adminService.fetchContent({
		page,
		...(institutionId ? { institutionId } : {}),
		...(contentStatusId ? { contentStatusId } : {}),
		...(contentTypeId ? { contentTypeId } : {}),
		...(tagId ? { tagId } : {}),
		...(sharingOn ? { sharingOn } : {}),
		...(search ? { search } : {}),
		...(orderBy && { orderBy }),
	});

	request.signal.addEventListener('abort', () => {
		contentTagsResponse.abort();
		contentStatusesRequest.abort();
		contentFiltersRequest.abort();
		contentRequest.abort();
	});

	const resourcesPromise = Promise.all([
		contentTagsResponse.fetch(),
		contentStatusesRequest.fetch(),
		contentFiltersRequest.fetch(),
		contentRequest.fetch(),
	]);

	return defer({
		resourcesPromise,
	});
}

const contentStatusBadgeProps = {
	[ContentStatusId.DRAFT]: {
		bg: 'outline-gray',
		children: 'Draft',
	},
	[ContentStatusId.EXPIRED]: {
		bg: 'outline-danger',
		children: 'Expired',
	},
	[ContentStatusId.LIVE]: {
		bg: 'outline-success',
		children: 'Live',
	},
	[ContentStatusId.SCHEDULED]: {
		bg: 'outline-attention',
		children: 'Scheduled',
	},
	[ContentStatusId.AVAILABLE]: {
		bg: 'outline-primary',
		children: 'Available',
	},
};

export const Component = () => {
	const { resourcesPromise } = useAdminResourcesLoaderData();
	const navigate = useNavigate();
	const handleError = useHandleError();

	const [searchParams, setSearchParams] = useSearchParams();
	const page = searchParams.get('page') ?? '0';

	const [isLoading, setIsLoading] = useState(false);
	const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
	const [tags, setTags] = useState<Tag[]>([]);
	const [contentStatuses, setContentStatuses] = useState<ContentStatus[]>([]);
	const [contentFilters, setContentFilters] = useState<ContentFiltersResponse>();
	const [nextFilters, setNextFilters] = useState<Record<string, string | null>>({});
	const [nextSort, setNextSort] = useState<string | null>(null);
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
				const [tagsResponse, contentStatusesResposne, contentFiltersResponse, contentResponse] =
					await resourcesPromise;

				setTags(tagsResponse.tags);
				setContentStatuses(contentStatusesResposne.contentStatuses);
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
		searchParams.set('page', String(pageIndex));
		setSearchParams(searchParams);
	};

	const filters = useMemo(
		() => [
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
				searchParam: 'contentStatusId',
				initialValue: searchParams.get('contentStatusId'),
				active: searchParams.get('contentStatusId') !== null,
				options:
					contentStatuses.map((contentStatusOption) => ({
						label: contentStatusOption.description,
						value: contentStatusOption.contentStatusId,
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
				options: tags.map((tag) => ({
					label: tag.name,
					value: tag.tagId,
				})),
			},
			{
				name: 'Sharing',
				searchParam: 'sharingOn',
				initialValue: searchParams.get('sharingOn'),
				active: searchParams.get('sharingOn') !== null,
				options: [
					{
						label: 'On',
						value: 'true',
					},
					{
						label: 'Off',
						value: 'false',
					},
				],
			},
		],
		[contentFilters?.contentTypes, contentFilters?.institutions, contentStatuses, searchParams, tags]
	);

	const sortOptions = [
		{
			label: 'Date Added Descending',
			value: AdminContentSortOrder.DATE_ADDED_DESC,
		},
		{
			label: 'Date Added Ascending',
			value: AdminContentSortOrder.DATE_ADDED_ASC,
		},
		{
			label: 'Publish Date Descending',
			value: AdminContentSortOrder.PUBLISH_DATE_DESC,
		},
		{
			label: 'Publish Date Ascending',
			value: AdminContentSortOrder.PUBLISH_DATE_ASC,
		},
		{
			label: 'Exp Date Descending',
			value: AdminContentSortOrder.EXPIRY_DATE_DESC,
		},
		{
			label: 'Exp Date Ascending',
			value: AdminContentSortOrder.EXPIRY_DATE_ASC,
		},
	];

	const orderBy = searchParams.get('orderBy');
	const selectedSort = sortOptions.find((o) => o.value === orderBy) ?? sortOptions[0];

	const sortConfig = {
		name: `Sort by: ${selectedSort.label}`,
		searchParam: 'orderBy',
		initialValue: orderBy,
		active: searchParams.get('orderBy') !== null,
		options: sortOptions,
	};

	const contentTotalCount = content?.totalCount ?? 0;

	const replaceContent = useCallback(
		(action: AdminContentAction, newContent?: AdminContent) => {
			if (!newContent) {
				return;
			}

			const contentClone = cloneDeep(content);
			const contentIndexToReplace =
				content?.adminContent.findIndex((ac) => ac.contentId === newContent.contentId) ?? -1;

			if (contentClone && contentIndexToReplace > -1) {
				if (action === AdminContentAction.DELETE) {
					contentClone.adminContent.splice(contentIndexToReplace, 1);
				} else {
					contentClone.adminContent[contentIndexToReplace] = newContent;
				}
			}

			setContent(contentClone);
		},
		[content]
	);

	useEffect(() => {
		const initialNextFilters = filters.reduce((accumulator, currentValue) => {
			return {
				...accumulator,
				[currentValue.searchParam]: searchParams.get(currentValue.searchParam),
			};
		}, {} as typeof nextFilters);

		setNextFilters(initialNextFilters);
	}, [filters, searchParams]);

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
										key={filterId}
										className={classNames({ 'me-2': !isLast })}
										active={filterConfig.active}
										id={filterId}
										title={filterConfig.name}
										dismissText="Clear"
										onDismiss={() => {
											searchParams.delete(filterConfig.searchParam);
											searchParams.delete('page');
											setSearchParams(searchParams);
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

											searchParams.delete('page');
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
						<div className="d-flex">
							<FilterDropdown
								showSortIcon
								iconLeft
								className="ms-auto"
								active={sortConfig.active}
								id="admin-resource-sort"
								title={sortConfig.name}
								dismissText="Clear"
								onHide={() => {
									setNextSort(orderBy);
								}}
								onDismiss={() => {
									searchParams.delete('orderBy');
									setNextSort(null);
									setSearchParams(searchParams);
								}}
								confirmText="Apply"
								onConfirm={() => {
									if (nextSort) {
										searchParams.set('orderBy', nextSort);
										setSearchParams(searchParams);
									}
								}}
								width={240}
							>
								{sortOptions.map((option) => (
									<Form.Check
										key={option.value}
										type="radio"
										name="admin-resource-sort"
										id={`admin-resource-sort--${option.value}`}
										label={option.label}
										value={option.value}
										checked={(nextSort ?? selectedSort.value) === option.value}
										onChange={({ currentTarget }) => {
											setNextSort(currentTarget.value);
										}}
									/>
								))}
							</FilterDropdown>
						</div>
					</Col>
				</Row>
				<Suspense>
					<Await resolve={resourcesPromise}>
						<Row className="mb-8">
							<Col>
								<Table isLoading={isLoading}>
									<TableHead>
										<TableRow>
											<TableCell header>Date Added</TableCell>
											<TableCell header>Resource Details</TableCell>
											<TableCell header>Owner</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header>Publish Date</TableCell>
											<TableCell header>Expiry Date</TableCell>
											<TableCell header>In Use</TableCell>
											<TableCell header />
										</TableRow>
									</TableHead>
									<TableBody>
										{content?.adminContent.map((content) => {
											const isAvailable = content.actions.includes(AdminContentAction.ADD);

											return (
												<TableRow key={content.contentId}>
													<TableCell>{content.dateCreatedDescription}</TableCell>

													<TableCell width={460}>
														<div className="d-flex align-items-center">
															<OverlayTrigger
																placement="bottom"
																overlay={
																	<Tooltip>{content.contentTypeDescription}</Tooltip>
																}
															>
																<div className="text-muted me-2">
																	<ContentTypeIcon
																		contentTypeId={content.contentTypeId}
																	/>
																</div>
															</OverlayTrigger>

															<div
																className={classNames('text-truncate', true && 'me-5')}
															>
																<Link
																	className="text-decoration-none"
																	to={{
																		pathname: `/admin/resources/${
																			content.isEditable ? 'edit' : 'preview'
																		}/${content.contentId}`,
																		search: content.isEditable
																			? '?startOnPreview=true'
																			: '',
																	}}
																>
																	{content.title}
																</Link>

																<p className={'mb-0'}>
																	<small>{content.author}</small>
																</p>
															</div>

															{content.newFlag && (
																<div>
																	<Badge pill>New</Badge>
																</div>
															)}
														</div>
													</TableCell>

													<TableCell>{content.ownerInstitution}</TableCell>

													<TableCell>
														<div>
															<Badge
																pill
																{...contentStatusBadgeProps[content.contentStatusId]}
																className="me-2"
															/>
														</div>
													</TableCell>

													<TableCell>{content.publishStartDateDescription}</TableCell>

													<TableCell>
														{content.publishEndDateDescription ?? 'No Expiry'}
													</TableCell>

													<TableCell>
														<OverlayTrigger
															placement="bottom"
															overlay={
																<Tooltip>{content.inUseInstitutionDescription}</Tooltip>
															}
														>
															<div>{content.inUseCount}</div>
														</OverlayTrigger>
													</TableCell>

													<TableCell>
														<div className="d-flex justify-content-end">
															{isAvailable ? (
																<LoadingButton
																	className="me-2"
																	variant="outline-primary"
																	isLoading={!!isAdding[content.contentId]}
																	onClick={async () => {
																		setIsAdding((curr) => ({
																			...curr,
																			[content.contentId]: true,
																		}));

																		try {
																			const response = await adminService
																				.addContent(content.contentId)
																				.fetch();

																			replaceContent(
																				AdminContentAction.ADD,
																				response.content
																			);
																		} catch (e) {
																			handleError(e);
																		} finally {
																			setIsAdding((curr) => {
																				delete curr[content.contentId];

																				return {
																					...curr,
																				};
																			});
																		}
																	}}
																>
																	Add
																</LoadingButton>
															) : (
																<AdminResourcesTableDropdown
																	content={content}
																	onRefresh={replaceContent}
																/>
															)}
														</div>
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
										page={parseInt(page, 10)}
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
