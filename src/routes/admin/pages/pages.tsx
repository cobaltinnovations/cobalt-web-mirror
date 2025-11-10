import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { PAGE_STATUS_ID, PageDetailModel, PageRowMailingListModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { useCopyTextToClipboard } from '@/hooks/use-copy-text-to-clipboard';
import useFlags from '@/hooks/use-flags';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { AddPageModal, MailingListActionsDropdown, PageActionsDropdown } from '@/components/admin/pages';
import NoData from '@/components/no-data';
import ConfirmDialog from '@/components/confirm-dialog';
import SvgIcon from '@/components/svg-icon';
import { buildBackendDownloadUrl } from '@/lib/utils';

export async function loader() {
	return null;
}

export const Component = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '', [searchParams]);
	const pageSize = useMemo(() => searchParams.get('pageSize') ?? '', [searchParams]);
	const orderBy = useMemo(() => searchParams.get('orderBy') ?? '', [searchParams]);
	const { addFlag } = useFlags();

	const [isLoading, setIsLoading] = useState(false);
	const [pages, setPages] = useState<PageDetailModel[]>([]);
	const [pagesTotalCount, setPagesTotalCount] = useState(0);
	const [pagesTotalCountDescription, setPagesTotalCountDescription] = useState('0');

	const [selectedPage, setSelectedPage] = useState<PageDetailModel>();
	const [showAddPageModal, setShowAddPageModal] = useState(false);
	const [showDeletePageModal, setShowDeletePageModal] = useState(false);
	const [showUnpublishPageModal, setShowUnpublishPageModal] = useState(false);

	const copyTextToClipboard = useCopyTextToClipboard();

	const fetchPages = useCallback(async () => {
		setIsLoading(true);

		try {
			const { pages, totalCount, totalCountDescription } = await pagesService
				.getPages({
					...(pageNumber && { pageNumber }),
					...(pageSize && { pageSize }),
					...(orderBy && { orderBy }),
				})
				.fetch();

			setPages(pages);
			setPagesTotalCount(totalCount);
			setPagesTotalCountDescription(totalCountDescription);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, orderBy, pageNumber, pageSize]);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	const handlePageButtonClick = useCallback(
		async (pageId: string) => {
			try {
				const response = await pagesService.getPageEditId(pageId).fetch();
				navigate(`/admin/pages/${response.pageId}`);
			} catch (error) {
				handleError(error);
			}
		},
		[handleError, navigate]
	);

	const handleDeletePage = useCallback(async () => {
		setIsLoading(true);

		try {
			if (!selectedPage) {
				throw new Error('selectedPage is undefined.');
			}

			await pagesService.deletePage(selectedPage.pageId).fetch();

			setSelectedPage(undefined);
			setShowDeletePageModal(false);
			fetchPages();
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchPages, handleError, selectedPage]);

	const handleUnpublish = useCallback(async () => {
		setIsLoading(true);

		try {
			if (!selectedPage) {
				throw new Error('selectedPage is undefined.');
			}

			const response = await pagesService.unpublishPage(selectedPage.pageId).fetch();

			setSelectedPage(undefined);
			setShowUnpublishPageModal(false);
			fetchPages();

			addFlag({
				variant: 'success',
				title: `${response.page.name} page unpublished.`,
				description: `Your page is no longer available on Cobalt.`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [addFlag, fetchPages, handleError, selectedPage]);

	const handlePaginationClick = (pageIndex: number) => {
		searchParams.set('pageNumber', String(pageIndex));
		setSearchParams(searchParams);
	};

	const handleMailingListCopy = async (page: PageDetailModel) => {
		try {
			const response = await pagesService.getPageRowMailingListsForPageById(page.pageId).fetch();
			const pageRowMailingLists: PageRowMailingListModel[] = response.pageRowMailingLists ?? [];

			// Pick out only email addresses across all subscribe rows for now.
			// Revisit later when UI supports more types (e.g. phone number) and/or multiple subscribe rows
			const emailValues = pageRowMailingLists.flatMap((list) =>
				(list.mailingListEntries ?? [])
					.filter((entry) => entry.mailingListEntryTypeId === 'EMAIL_ADDRESS')
					.map((entry) => entry.value)
			);

			copyTextToClipboard(emailValues.join(', '), {
				successTitle: 'Email addresses copied to clipboard',
				successDescription:
					'The subscribed email addresses were to your clipboard. Paste them into the "BCC" field of your email client.',
				errorTitle: 'Failed to copy email addresses',
				errorDesctiption: 'Please try again.',
			});
		} catch (error) {
			handleError(error);
		}
	};

	const handleMailingListDownload = async (page: PageDetailModel) => {
		window.location.href = buildBackendDownloadUrl('/page-row-mailing-lists/csv', {
			pageId: page.pageId,
		});
	};

	return (
		<>
			<AddPageModal
				page={selectedPage}
				show={showAddPageModal}
				onHide={() => {
					setSelectedPage(undefined);
					setShowAddPageModal(false);
				}}
				onContinue={(pageId) => {
					navigate(`/admin/pages/${pageId}`);
				}}
			/>

			<ConfirmDialog
				show={showDeletePageModal}
				size="lg"
				titleText="Delete"
				bodyText="Are you sure you want to delete this page?"
				detailText={<p className="mt-2 mb-0">This action is permanent.</p>}
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				onHide={() => {
					setSelectedPage(undefined);
					setShowDeletePageModal(false);
				}}
				onConfirm={handleDeletePage}
			/>

			<ConfirmDialog
				show={showUnpublishPageModal}
				size="lg"
				titleText="Unpublish Page"
				bodyText={`Are you sure you want to unpublish ${selectedPage?.name}?`}
				detailText={
					<p className="mt-2 mb-0">“{selectedPage?.name}” will be removed from Cobalt immediately.</p>
				}
				dismissText="Cancel"
				confirmText="Unpublish"
				destructive
				onHide={() => {
					setSelectedPage(undefined);
					setShowUnpublishPageModal(false);
				}}
				onConfirm={handleUnpublish}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">Pages</h2>
							<Button
								variant="primary"
								className="d-flex align-items-center"
								onClick={() => {
									setShowAddPageModal(true);
								}}
							>
								<SvgIcon kit="fas" icon="plus" size={16} className="me-2" />
								Add Page
							</Button>
						</div>
						<hr />
					</Col>
				</Row>

				<Row className="mb-8">
					<Col>
						<Table isLoading={isLoading}>
							<TableHead>
								<TableRow>
									<TableCell header width="48%">
										Name
									</TableCell>
									<TableCell header>Status</TableCell>
									<TableCell header>Created</TableCell>
									<TableCell header>Modified</TableCell>
									<TableCell header>Published</TableCell>
									<TableCell header className="text-right">
										Subscribers
									</TableCell>
									<TableCell header />
								</TableRow>
							</TableHead>
							<TableBody>
								{pages.length <= 0 && (
									<TableRow>
										<TableCell colSpan={6}>
											<NoData title="No pages" actions={[]} />
										</TableCell>
									</TableRow>
								)}
								{pages.map((page) => {
									return (
										<TableRow key={page.pageId}>
											<TableCell className="text-nowrap" width="48%">
												<Button
													variant="link"
													className="p-0 text-decoration-none text-left"
													onClick={() => {
														handlePageButtonClick(page.pageId);
													}}
												>
													{page.name}
												</Button>
											</TableCell>
											<TableCell>
												<div>
													{page.pageStatusId === PAGE_STATUS_ID.DRAFT && (
														<Badge pill bg="outline-dark" className="text-nowrap">
															Draft
														</Badge>
													)}
													{page.pageStatusId === PAGE_STATUS_ID.LIVE && (
														<Badge pill bg="outline-success" className="text-nowrap">
															Live
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-nowrap">{page.createdDescription}</TableCell>
											<TableCell className="text-nowrap">{page.lastUpdatedDescription}</TableCell>
											<TableCell className="text-nowrap">
												{page.publishedDateDescription}
											</TableCell>
											<TableCell className="text-nowrap text-right">
												{page.mailingListEntryCountDescription}
											</TableCell>
											<TableCell className="align-items-center justify-content-end flex-row">
												{!!(page.mailingListEntryCount && page.mailingListEntryCount > 0) && (
													<MailingListActionsDropdown
														page={page}
														onCopy={handleMailingListCopy}
														onDownload={handleMailingListDownload}
													/>
												)}
												<PageActionsDropdown
													page={page}
													onEdit={({ pageId }) => {
														handlePageButtonClick(pageId);
													}}
													onDuplicate={() => {
														setSelectedPage(page);
														setShowAddPageModal(true);
													}}
													onDelete={() => {
														setSelectedPage(page);
														setShowDeletePageModal(true);
													}}
													onUnpublish={() => {
														setSelectedPage(page);
														setShowUnpublishPageModal(true);
													}}
												/>
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
								total={pagesTotalCount}
								page={parseInt(pageNumber, 10)}
								size={15}
								onClick={handlePaginationClick}
								disabled={isLoading}
							/>
						</div>
					</Col>
					<Col xs={4}>
						<div className="d-flex justify-content-end align-items-center">
							<p className="mb-0 fw-semibold text-gray">
								<span className="text-dark">{pages.length}</span> of{' '}
								<span className="text-dark">{pagesTotalCountDescription}</span> Pages
							</p>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};
