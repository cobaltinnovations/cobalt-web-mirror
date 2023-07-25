import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { AdminContentRow, ContentAvailableStatusId, ContentTypeId } from '@/lib/models';
import QuickFilterDropdown from '@/components/quick-filter-dropdown';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { adminService, ContentFiltersResponse } from '@/lib/services';
import AvailableContentRow from '@/components/admin-cms/available-content-row';
import { AlertLocationState } from '@/pages/admin-cms/on-your-time';
import { debounce } from 'lodash';
import { createUseStyles } from 'react-jss';
import mediaQueries from '@/jss/media-queries';
import SearchInput from '@/components/admin-cms/search-input';
import useHandleError from '@/hooks/use-handle-error';
import HeroContainer from '@/components/hero-container';
import useFlags from '@/hooks/use-flags';
import { Helmet } from 'react-helmet';

const useStyles = createUseStyles({
	controlBar: {
		display: 'flex',
		marginBottom: 20,
		alignItems: 'center',
		justifyContent: 'space-between',
		[mediaQueries.lg]: {
			display: 'block',
		},
	},
	searchBarOuter: {
		width: '30%',
		[mediaQueries.lg]: {
			width: 'auto',
			marginBottom: 20,
		},
	},
});

const CmsAvailableContent: FC = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();
	const { addFlag } = useFlags();
	const [tableIsUpdating, setTableIsUpdating] = useState(false);
	const [currentPageIndex, setCurrentPageIndex] = useState(0);
	const [content, setContent] = useState<AdminContentRow[]>([]);
	const [filters, setFilters] = useState<ContentFiltersResponse | undefined>(undefined);
	const [totalNumberOfItems, setTotalNumberOfItems] = useState(0);

	const [searchInputValue, setSearchInputValue] = useState('');
	const [searchInputValueDebounced, setSearchInputValueDebounced] = useState('');
	const setDebouncedSearchInputValue = useRef(
		debounce((value: string) => setSearchInputValueDebounced(value), 500)
	).current;

	const [typeFilterValue, setTypeFilterValue] = useState<ContentTypeId | undefined>(undefined);
	const [statusFilterValue, setStatusFilterValue] = useState<ContentAvailableStatusId | undefined>(undefined);

	const handleSearchInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setCurrentPageIndex(0);
			setSearchInputValue(event.currentTarget.value);
			setDebouncedSearchInputValue(event.currentTarget.value);
		},
		[setDebouncedSearchInputValue]
	);

	useEffect(() => {
		async function getTablePage() {
			setTableIsUpdating(true);

			try {
				const [filtersResponse, { adminContent, totalCount }] = await Promise.all([
					adminService.fetchAvailableContentFilters().fetch(),
					adminService
						.fetchAvailableContent({
							page: currentPageIndex,
							...(typeFilterValue ? { contentTypeId: typeFilterValue } : {}),
							...(statusFilterValue ? { availableStatusId: statusFilterValue } : {}),
							...(searchInputValueDebounced ? { search: searchInputValueDebounced } : {}),
						})
						.fetch(),
				]);
				setContent(adminContent);
				setTotalNumberOfItems(totalCount);
				setFilters(filtersResponse);
			} catch (error) {
				handleError(error);
			}

			setTableIsUpdating(false);

			const locationState = (location.state as AlertLocationState) || {};
			if (locationState?.showSuccess) {
				addFlag({
					variant: 'success',
					title: `Your content was ${locationState.isEditing ? 'updated' : 'added'}!`,
					actions: [],
				});

				navigate('', { replace: true, state: {} });
			}
		}

		getTablePage();
	}, [
		addFlag,
		currentPageIndex,
		handleError,
		location.state,
		navigate,
		searchInputValueDebounced,
		statusFilterValue,
		typeFilterValue,
	]);

	function handleTypeFilterChange(value: ContentTypeId | undefined) {
		setTypeFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handleStatusFilterChange(value: ContentAvailableStatusId | undefined) {
		setStatusFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handlePaginationClick(index: number) {
		setCurrentPageIndex(index);
	}

	function handleAddClick(contentId: string) {
		navigate({
			pathname: '/cms/on-your-time/create',
			search: `?contentId=${contentId}&adding=true`,
		});
	}

	function handleEditClick(contentId: string) {
		navigate({
			pathname: '/cms/on-your-time/create',
			search: `?contentId=${contentId}&editing=true&returnToAvailable=true`,
		});
	}

	function updateContentItem(content: AdminContentRow) {
		setContent((adminContent) => {
			return adminContent.map((ac) => {
				if (ac.contentId === content.contentId) {
					return content;
				} else {
					return ac;
				}
			});
		});
		addFlag({
			variant: 'success',
			title: 'Your content was removed',
			actions: [],
		});
	}

	async function handleRemoveClick(contentId: string) {
		const response = await adminService.updateContent(contentId, { removeFromInstitution: true })?.fetch();
		if (response?.adminContent) {
			updateContentItem(response?.adminContent);
		}
	}

	// @ts-ignore
	return (
		<>
			<Helmet>
				<title>Cobalt | Available Content</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-0 text-center">On Your Time - Available Content</h2>
			</HeroContainer>
			<Container className="py-5">
				<Row>
					<Col>
						<div className={classes.controlBar}>
							<div className={classes.searchBarOuter}>
								<SearchInput value={searchInputValue} onChange={handleSearchInputChange} />
							</div>
							<div className="d-flex align-items-center justify-content-center">
								{!!filters?.contentTypes && (
									<QuickFilterDropdown
										active={!!typeFilterValue}
										value={typeFilterValue}
										id="type-quick-filter"
										title="Type"
										items={[
											{
												value: undefined,
												label: 'No Filter',
											},
											...filters?.contentTypes?.map(({ contentTypeId, description }) => {
												return {
													value: contentTypeId,
													label: description,
												};
											}),
										]}
										onChange={(value) => handleTypeFilterChange(value as ContentTypeId | undefined)}
									/>
								)}
								{!!filters?.availableStatuses && (
									<QuickFilterDropdown
										active={!!statusFilterValue}
										value={statusFilterValue}
										id="status-quick-filter"
										title="My Institution"
										items={[
											{
												value: undefined,
												label: 'No Filter',
											},
											...filters?.availableStatuses.map(({ availableStatusId, description }) => {
												return {
													value: availableStatusId,
													label: description,
												};
											}),
										]}
										onChange={(value) =>
											handleStatusFilterChange(value as ContentAvailableStatusId | undefined)
										}
									/>
								)}
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<Table className="mb-5" style={{ opacity: tableIsUpdating ? 0.5 : 1 }}>
							<TableHead>
								<TableRow>
									<TableCell header>Submitted</TableCell>
									<TableCell header className="justify-content-center">
										Type
									</TableCell>
									<TableCell header>Title & Author</TableCell>
									<TableCell header>Owner</TableCell>
									<TableCell header>Status</TableCell>
									<TableCell />
								</TableRow>
							</TableHead>
							<TableBody>
								{content.map((content) => {
									return (
										<AvailableContentRow
											key={content.contentId}
											content={content}
											onAddClick={handleAddClick}
											onEditClick={handleEditClick}
											onRemoveClick={handleRemoveClick}
										/>
									);
								})}
							</TableBody>
						</Table>
					</Col>
				</Row>
				<Row>
					<Col>
						{content && content.length > 0 && (
							<div className="d-flex justify-content-center">
								<TablePagination
									total={totalNumberOfItems}
									page={currentPageIndex}
									size={15}
									onClick={handlePaginationClick}
								/>
							</div>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default CmsAvailableContent;
