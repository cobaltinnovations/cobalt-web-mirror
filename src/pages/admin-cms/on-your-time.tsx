import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { AdminContentRow, ContentApprovalStatusId, ContentTypeId, ROLE_ID } from '@/lib/models';
import QuickFilterDropdown from '@/components/quick-filter-dropdown';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { adminService, ContentFiltersResponse } from '@/lib/services';
import OnYourTimeContentRow from '@/components/admin-cms/on-your-time-row';
import useAccount from '@/hooks/use-account';
import useAlert from '@/hooks/use-alert';
import { debounce } from 'lodash';
import { createUseStyles } from 'react-jss';
import mediaQueries from '@/jss/media-queries';
import SearchInput from '@/components/admin-cms/search-input';
import useHandleError from '@/hooks/use-handle-error';
import HeroContainer from '@/components/hero-container';

const useStyles = createUseStyles({
	controlBar: {
		display: 'flex',
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
	filtersOuter: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			marginBottom: 15,
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
	const { account } = useAccount();
	const { showAlert } = useAlert();
	const isSuperAdmin = account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR;
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

	useEffect(() => {
		async function getTablePage() {
			setTableIsUpdating(true);

			try {
				const locationState = (location.state as AlertLocationState) || {};
				if (locationState?.showSuccess) {
					showAlert({
						text: `Your content was ${locationState.isEditing ? 'updated' : 'added'}!`,
						variant: 'success',
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
		showAlert,
		navigate,
		searchInputValueDebounced,
		handleError,
		location.state,
	]);

	function handleAddContentButtonClick(): void {
		navigate('/cms/on-your-time/create');
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
			showAlert({ variant: 'success', text: `Your content was approved!` });
		} catch (e) {
			handleError(e);
		}
	}
	async function handleArchiveToggle(contentId: string, archivedFlag: boolean) {
		try {
			let { content } = await adminService.updateArchiveFlag(contentId, archivedFlag).fetch();
			updateContentItem(content as AdminContentRow);
			showAlert({ variant: 'success', text: `Your content was ${archivedFlag ? 'archived' : 'unarchived'}!` });
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
			showAlert({ variant: 'danger', text: `Your content was deleted!` });
		} catch (e) {
			handleError(e);
		}
	}

	function handleEditClick(contentId: string) {
		navigate(`/cms/on-your-time/create?contentId=${contentId}&editing=true`);
	}

	async function handleRejectClick(contentId: string) {
		try {
			let { content } = await adminService
				.updateContentApprovalStatus(contentId, ContentApprovalStatusId.Rejected)
				.fetch();
			updateContentItem(content as AdminContentRow);
			showAlert({ variant: 'danger', text: `Your content was rejected!` });
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
			<HeroContainer>
				<h2 className="mb-0 text-center">On Your Time - My Content</h2>
			</HeroContainer>
			<Container className="pt-5 mb-5">
				<Row>
					<Col>
						<div className={classes.controlBar}>
							<div className={classes.searchBarOuter}>
								<SearchInput value={searchInputValue} onChange={handleSearchInputChange} />
							</div>
							<div className={classes.filtersOuter}>
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
							<div className="text-center">
								<Button size="sm" onClick={handleAddContentButtonClick}>
									+ Add Content
								</Button>
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
