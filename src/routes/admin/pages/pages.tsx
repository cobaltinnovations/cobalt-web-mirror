import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Await,
	defer,
	Link,
	LoaderFunctionArgs,
	useNavigate,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { PAGE_STATUS_ID, PageModel } from '@/lib/models';
import { GetPagesResponse, pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { AddPageModal, PageActionsDropdown } from '@/components/admin/pages';
import NoData from '@/components/no-data';
import ConfirmDialog from '@/components/confirm-dialog';

interface AdminPagesLoaderData {
	pagesPromise: Promise<GetPagesResponse>;
}

export function useAdminGroupSessionsLoaderData() {
	return useRouteLoaderData('admin-pages') as AdminPagesLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const pageNumber = url.searchParams.get('pageNumber');
	const pageSize = url.searchParams.get('pageSize');
	const orderBy = url.searchParams.get('orderBy');

	const pagesPromise = pagesService
		.getPages({
			...(pageNumber && { pageNumber }),
			...(pageSize && { pageSize }),
			...(orderBy && { orderBy }),
		})
		.fetch();

	return defer({ pagesPromise });
}

export const Component = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);

	const { pagesPromise } = useAdminGroupSessionsLoaderData();
	const [isLoading, setIsLoading] = useState(false);
	const [pages, setPages] = useState<PageModel[]>([]);
	const [pagesTotalCount, setPagesTotalCount] = useState(0);
	const [pagesTotalCountDescription, setPagesTotalCountDescription] = useState('0');

	const [showAddPageModal, setShowAddPageModal] = useState(false);
	const [showDeletePageModal, setShowDeletePageModal] = useState(false);
	const [showUnpublishPageModal, setShowUnpublishPageModal] = useState(false);

	const fetchPages = useCallback(async () => {
		if (!pagesPromise) {
			return;
		}

		setIsLoading(true);

		try {
			const { pages, totalCount, totalCountDescription } = await pagesPromise;

			setPages(pages);
			setPagesTotalCount(totalCount);
			setPagesTotalCountDescription(totalCountDescription);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, pagesPromise]);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	const handlePaginationClick = (pageIndex: number) => {
		searchParams.set('pageNumber', String(pageIndex));
		setSearchParams(searchParams);
	};

	return (
		<>
			<AddPageModal
				show={showAddPageModal}
				onHide={() => {
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
					setShowDeletePageModal(false);
				}}
				onConfirm={() => {
					setShowDeletePageModal(false);
				}}
			/>

			<ConfirmDialog
				show={showUnpublishPageModal}
				size="lg"
				titleText="Unpublish Page"
				bodyText={`Are you sure you want to unpublish ${'[TODO]: Page Name'}?`}
				detailText={<p className="mt-2 mb-0">“[TODO]: Page Name” will be removed from Cobalt immediately.</p>}
				dismissText="Cancel"
				confirmText="Unpublish"
				destructive
				onHide={() => {
					setShowUnpublishPageModal(false);
				}}
				onConfirm={() => {
					setShowUnpublishPageModal(false);
				}}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">Pages</h2>
							<Button
								onClick={() => {
									setShowAddPageModal(true);
								}}
							>
								Add Page
							</Button>
						</div>
						<hr />
					</Col>
				</Row>
				<Suspense>
					<Await resolve={pagesPromise}>
						<Row className="mb-8">
							<Col>
								<Table isLoading={isLoading}>
									<TableHead>
										<TableRow>
											<TableCell header>Name</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header>Created</TableCell>
											<TableCell header>Modified</TableCell>
											<TableCell header>Published</TableCell>
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
													<TableCell className="text-nowrap">
														<Link
															className="text-decoration-none"
															to={`/admin/pages/${page.pageId}`}
														>
															{page.name}
														</Link>
													</TableCell>
													<TableCell>
														<div>
															{page.pageStatusId === PAGE_STATUS_ID.DRAFT && (
																<Badge pill bg="outline-dark" className="text-nowrap">
																	Draft
																</Badge>
															)}
															{page.pageStatusId === PAGE_STATUS_ID.LIVE && (
																<Badge
																	pill
																	bg="outline-success"
																	className="text-nowrap"
																>
																	Live
																</Badge>
															)}
														</div>
													</TableCell>
													<TableCell className="text-nowrap">
														{page.createdDescription}
													</TableCell>
													<TableCell className="text-nowrap">
														{page.lastUpdatedDescription}
													</TableCell>
													<TableCell className="text-nowrap">
														{page.publishedDateDescription}
													</TableCell>
													<TableCell className="text-right">
														<PageActionsDropdown
															page={page}
															onDelete={() => {
																setShowDeletePageModal(true);
															}}
															onUnpublish={() => {
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
					</Await>
				</Suspense>
			</Container>
		</>
	);
};
