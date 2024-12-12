import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Col, Container, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { AdminContent, AdminContentAction, ContentStatus, ContentStatusId, ContentTypeId, Tag } from '@/lib/models';
import { AdminContentListResponse, AdminContentSortOrder, ContentFiltersResponse, adminService } from '@/lib/services';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import FilterDropdown from '@/components/filter-dropdown';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import InputHelperSearch from '@/components/input-helper-search';
import { AdminResourcesTableDropdown } from '@/components/admin';
import ContentTypeIcon from '@/components/content-type-icon';
import LoadingButton from '@/components/loading-button';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as CancelIcon } from '@/assets/icons/icon-cancel.svg';
import AsyncWrapper from '@/components/async-page';

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

export function loader() {
	return null;
}

export const Component = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();

	const [searchParams, setSearchParams] = useSearchParams();
	const page = useMemo(() => parseInt(searchParams.get('page') ?? '0', 10), [searchParams]);
	const institutionId = useMemo(() => searchParams.get('institutionId') ?? '', [searchParams]);
	const contentStatusId = useMemo(() => searchParams.get('contentStatusId') ?? '', [searchParams]);
	const contentTypeId = useMemo(() => searchParams.get('contentTypeId') ?? '', [searchParams]);
	const tagId = useMemo(() => searchParams.get('tagId') ?? '', [searchParams]);
	const sharingOn = useMemo(() => searchParams.get('sharingOn') ?? '', [searchParams]);
	const search = useMemo(() => searchParams.get('search') ?? '', [searchParams]);
	const orderBy = useMemo(() => searchParams.get('orderBy') ?? '', [searchParams]);

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
	const [showClearButton, setShowClearButton] = useState(false);

	const fetchFilters = useCallback(async () => {
		const [tagsResponse, statusResponse, filtersResposne] = await Promise.all([
			adminService.fetchContentTags().fetch(),
			adminService.fetchContentStatuses().fetch(),
			adminService.fetchMyContentFilters().fetch(),
		]);

		setTags(tagsResponse.tags);
		setContentStatuses(statusResponse.contentStatuses);
		setContentFilters(filtersResposne);
	}, []);

	const fetchContent = useCallback(async () => {
		try {
			setIsLoading(true);

			const response = await adminService
				.fetchContent({
					page,
					...(institutionId && { institutionId }),
					...(contentStatusId && { contentStatusId: contentStatusId as ContentStatusId }),
					...(contentTypeId && { contentTypeId: contentTypeId as ContentTypeId }),
					...(tagId && { tagId }),
					...(sharingOn && { sharingOn }),
					...(search && { search }),
					...(orderBy && { orderBy }),
				})
				.fetch();

			setContent(response);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [contentStatusId, contentTypeId, handleError, institutionId, orderBy, page, search, sharingOn, tagId]);

	useEffect(() => {
		fetchContent();
	}, [fetchContent]);

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

	const handlePaginationClick = (pageIndex: number) => {
		// bandaid to set loading while other react-router-dom calls are resolving.
		// it seems that these page level calls wont even begin until outer wrappers resolve.
		// setIsLoading(true);

		searchParams.set('page', String(pageIndex));
		setSearchParams(searchParams, { replace: true });
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

	const activeFilters = useMemo(() => {
		let params: Record<string, string | undefined> = {};

		filters.forEach((filter) => {
			const valueFromUrl = searchParams.get(filter.searchParam);

			if (!valueFromUrl) {
				return;
			}

			params[filter.searchParam] = valueFromUrl;
		});

		return params;
	}, [filters, searchParams]);

	useEffect(() => {
		const filtersAreActive = Object.values(activeFilters).length > 0;
		setShowClearButton(filtersAreActive);
	}, [activeFilters]);

	return (
		<AsyncWrapper fetchData={fetchFilters}>
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

							{showClearButton && (
								<Button
									className="d-flex align-items-center text-decoration-none text-nowrap"
									variant="link"
									onClick={() => {
										filters.forEach((filter) => {
											searchParams.delete(filter.searchParam);
										});

										setSearchParams(searchParams);
									}}
								>
									<CancelIcon className="me-2" />
									Clear Filters
								</Button>
							)}
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
									<TableCell header className="align-items-end">
										Views
									</TableCell>
									<TableCell header className="align-items-end">
										In Use
									</TableCell>
									<TableCell header />
								</TableRow>
							</TableHead>
							<TableBody>
								{content?.adminContent.map((content) => {
									const isAvailable = content.actions.includes(AdminContentAction.ADD);

									return (
										<TableRow key={content.contentId}>
											<TableCell>
												<div className="d-flex align-items-center">
													{content.dateAddedToInstitutionDescription}{' '}
													{content.newFlag && (
														<div className="ms-4">
															<Badge pill>New</Badge>
														</div>
													)}
												</div>
											</TableCell>

											<TableCell width={480}>
												<div className="d-flex align-items-center">
													<OverlayTrigger
														placement="bottom"
														overlay={<Tooltip>{content.contentTypeDescription}</Tooltip>}
													>
														<div className="text-muted me-4">
															<ContentTypeIcon contentTypeId={content.contentTypeId} />
														</div>
													</OverlayTrigger>

													<div className={classNames('text-truncate', true && 'me-5')}>
														<Link
															className="text-decoration-none"
															to={{
																pathname: `/admin/resources/${
																	content.isEditable ? 'edit' : 'preview'
																}/${content.contentId}`,
															}}
														>
															{content.title}
														</Link>
														<small className="text-truncate">{content.author}</small>
													</div>
												</div>
											</TableCell>

											<TableCell>{content.ownerInstitution}</TableCell>

											<TableCell width={120}>
												<div>
													<Badge
														pill
														{...contentStatusBadgeProps[content.contentStatusId]}
														className="me-2"
													/>
												</div>
											</TableCell>

											<TableCell>{content.publishStartDateDescription}</TableCell>

											<TableCell>{content.publishEndDateDescription ?? 'No Expiry'}</TableCell>

											<TableCell className="align-items-end">{content.views}</TableCell>

											<TableCell className="align-items-end">
												{content.inUseCount > 0 ? (
													<OverlayTrigger
														placement="bottom"
														overlay={
															<Tooltip>{content.inUseInstitutionDescription}</Tooltip>
														}
													>
														<div>{content.inUseCount}</div>
													</OverlayTrigger>
												) : (
													<>{content.inUseCount}</>
												)}
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
								page={page}
								size={15}
								onClick={handlePaginationClick}
								disabled={isLoading}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};
