import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { Helmet } from 'react-helmet';

import { AdminContentRow, ContentApprovalStatusId, ContentTypeId } from '@/lib/models';
import { adminService, ContentFiltersResponse } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import QuickFilterDropdown from '@/components/quick-filter-dropdown';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import OnYourTimeContentRow from '@/components/admin-cms/on-your-time-row';
import mediaQueries from '@/jss/media-queries';
import InputHelperSearch from '@/components/input-helper-search';

const useStyles = createUseStyles({
	controlBar: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		[mediaQueries.lg]: {
			display: 'block',
		},
	},
});

export interface AlertLocationState {
	isAdding?: boolean;
	isEditing?: boolean;
	showSuccess?: boolean;
}

const CmsOnYourTime: FC = () => {
	const classes = useStyles();

	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();
	const { addFlag } = useFlags();
	const isSuperAdmin = false;
	const [tableIsUpdating, setTableIsUpdating] = useState(false);
	const [currentPageIndex, setCurrentPageIndex] = useState(0);
	const [filters, setFilters] = useState<ContentFiltersResponse>({} as ContentFiltersResponse);
	const [content, setContent] = useState<AdminContentRow[]>([]);
	const [totalNumberOfItems, setTotalNumberOfItems] = useState(0);

	const [searchInputValue, setSearchInputValue] = useState('');
	const [searchInputValueDebounced, setSearchInputValueDebounced] = useState('');
	const setDebouncedSearchInputValue = useRef(
		debounce((value: string) => setSearchInputValueDebounced(value), 500)
	).current;

	const [typeFilterValue, setTypeFilterValue] = useState<ContentTypeId | undefined>(undefined);
	const [ownerFilterValue, setOwnerFilterValue] = useState<string | undefined>(undefined);
	const [statusFilterValue, setStatusFilterValue] = useState<ContentApprovalStatusId | undefined>(undefined);
	const [otherStatusFilterValue, setOtherStatusFilterValue] = useState<ContentApprovalStatusId | undefined>(
		undefined
	);

	const handleSearchInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setCurrentPageIndex(0);
			setSearchInputValue(event.currentTarget.value);
			setDebouncedSearchInputValue(event.currentTarget.value);
		},
		[setDebouncedSearchInputValue]
	);

	const handleSearchInputClear = useCallback(() => {
		setCurrentPageIndex(0);
		setSearchInputValue('');
		setDebouncedSearchInputValue('');
	}, [setDebouncedSearchInputValue]);

	useEffect(() => {
		async function getTablePage() {
			setTableIsUpdating(true);

			try {
				const locationState = (location.state as AlertLocationState) || {};
				if (locationState?.showSuccess) {
					addFlag({
						variant: 'success',
						title: `Your content was ${locationState.isEditing ? 'updated' : 'added'}!`,
						actions: [],
					});
					navigate('', { replace: true, state: {} });
				}

				const [filtersResponse, { adminContent, totalCount }] = await Promise.all([
					adminService.fetchMyContentFilters().fetch(),
					adminService
						.fetchMyContent({
							page: currentPageIndex,
							...(typeFilterValue ? { contentTypeId: typeFilterValue } : {}),
							...(statusFilterValue ? { myApprovalStatusId: statusFilterValue } : {}),
							...(ownerFilterValue ? { institutionId: ownerFilterValue } : {}),
							...(otherStatusFilterValue ? { otherApprovalStatusId: otherStatusFilterValue } : {}),
							...(searchInputValueDebounced ? { search: searchInputValueDebounced } : {}),
						})
						.fetch(),
				]);

				setFilters(filtersResponse);
				setTotalNumberOfItems(totalCount);
				setContent(adminContent);
			} catch (error) {
				handleError(error);
			}

			setTableIsUpdating(false);
		}

		getTablePage();
	}, [
		currentPageIndex,
		statusFilterValue,
		typeFilterValue,
		ownerFilterValue,
		otherStatusFilterValue,
		navigate,
		searchInputValueDebounced,
		handleError,
		location.state,
		addFlag,
	]);

	function handleAddContentButtonClick(): void {
		navigate('/admin/my-content/create');
	}

	function handleTypeFilterChange(value: ContentTypeId | undefined) {
		setTypeFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handleOwnerFilterChange(value: string | undefined) {
		setOwnerFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handleStatusFilterChange(value: ContentApprovalStatusId | undefined) {
		setStatusFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handleVisibilityFilterChange(value: ContentApprovalStatusId | undefined) {
		setOtherStatusFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handlePaginationClick(index: number) {
		setCurrentPageIndex(index);
	}

	async function handleApproveClick(contentId: string) {
		try {
			let { content } = await adminService
				.updateContentApprovalStatus(contentId, ContentApprovalStatusId.Approved)
				.fetch();
			updateContentItem(content as AdminContentRow);
			addFlag({
				variant: 'success',
				title: 'Your content was approved!',
				actions: [],
			});
		} catch (e) {
			handleError(e);
		}
	}
	async function handleArchiveToggle(contentId: string, archivedFlag: boolean) {
		try {
			let { content } = await adminService.updateArchiveFlag(contentId, archivedFlag).fetch();
			updateContentItem(content as AdminContentRow);
			addFlag({
				variant: 'success',
				title: `Your content was ${archivedFlag ? 'archived' : 'unarchived'}!`,
				actions: [],
			});
		} catch (e) {
			handleError(e);
		}
	}

	async function handleDeleteClick(contentId: string) {
		try {
			let response = await adminService.deleteAdminContent(contentId).fetch();
			setContent((adminContent) => {
				return adminContent.filter((ac) => ac.contentId !== response.contentId);
			});
			addFlag({
				variant: 'danger',
				title: 'Your content was deleted!',
				actions: [],
			});
		} catch (e) {
			handleError(e);
		}
	}

	function handleEditClick(contentId: string) {
		navigate(`/admin/my-content/create?contentId=${contentId}&editing=true`);
	}

	async function handleRejectClick(contentId: string) {
		try {
			let { content } = await adminService
				.updateContentApprovalStatus(contentId, ContentApprovalStatusId.Rejected)
				.fetch();
			updateContentItem(content as AdminContentRow);
			addFlag({
				variant: 'danger',
				title: 'Your content was rejected!',
				actions: [],
			});
		} catch (e) {
			handleError(e);
		}
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
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | My Content</title>
			</Helmet>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">My Content</h2>
							<div className="d-flex align-items-center">
								<Button className="me-2" onClick={handleAddContentButtonClick}>
									+ Add Content
								</Button>
								<InputHelperSearch
									placeholder="Search"
									value={searchInputValue}
									onChange={handleSearchInputChange}
									onClear={handleSearchInputClear}
								/>
							</div>
						</div>
						<hr />
					</Col>
				</Row>
				<Row>
					<Col>
						<div className={classes.controlBar}>
							<div className="d-flex align-items-center">
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
								{isSuperAdmin && !!filters?.institutions && (
									<QuickFilterDropdown
										active={!!ownerFilterValue}
										value={ownerFilterValue}
										id="owner-quick-filter"
										title="Owner"
										items={[
											{
												value: undefined,
												label: 'No Filter',
											},
											...filters?.institutions?.map(({ institutionId, name }) => {
												return {
													value: institutionId,
													label: name,
												};
											}),
										]}
										onChange={(value) => handleOwnerFilterChange(value as string | undefined)}
									/>
								)}
								{!!filters?.myApprovalStatuses && (
									<QuickFilterDropdown
										active={!!statusFilterValue}
										value={statusFilterValue}
										id="my-status-quick-filter"
										title="My Institution"
										items={[
											{
												value: undefined,
												label: 'No Filter',
											},
											...filters?.myApprovalStatuses?.map(({ approvalStatusId, description }) => {
												return {
													value: approvalStatusId,
													label: description,
												};
											}),
										]}
										onChange={(value) =>
											handleStatusFilterChange(value as ContentApprovalStatusId | undefined)
										}
									/>
								)}
								{!!filters?.otherApprovalStatuses && (
									<QuickFilterDropdown
										active={!!otherStatusFilterValue}
										value={otherStatusFilterValue}
										id="other-status-quick-filter"
										title="Other Institutions"
										items={[
											{
												value: undefined,
												label: 'No Filter',
											},
											...filters?.otherApprovalStatuses?.map(
												({ approvalStatusId, description }) => {
													return {
														value: approvalStatusId,
														label: description,
													};
												}
											),
										]}
										onChange={(value) =>
											handleVisibilityFilterChange(value as ContentApprovalStatusId | undefined)
										}
									/>
								)}
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<Table className="mb-5 mt-5" style={{ opacity: tableIsUpdating ? 0.5 : 1 }}>
							<TableHead>
								<TableRow>
									<TableCell header>Submitted</TableCell>
									<TableCell header className="justify-content-center">
										Type
									</TableCell>
									<TableCell header width={300}>
										Post Details
									</TableCell>
									{isSuperAdmin && <TableCell header>Owner</TableCell>}
									<TableCell header className="justify-content-center">
										Views
									</TableCell>
									<TableCell header>My Institution</TableCell>
									<TableCell header>Other Institutions</TableCell>
									<TableCell />
								</TableRow>
							</TableHead>
							<TableBody>
								{content.map((content, index) => {
									return (
										<OnYourTimeContentRow
											key={index}
											content={content}
											onApproveClick={handleApproveClick}
											onArchiveToggle={handleArchiveToggle}
											onDeleteClick={handleDeleteClick}
											onEditClick={handleEditClick}
											onRejectClick={handleRejectClick}
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

export default CmsOnYourTime;
