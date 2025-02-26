import React, { useCallback, useState } from 'react';
import { Badge, Button, Tab } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { PAGE_STATUS_ID } from '@/lib/models';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { PageBuilderProvider } from '@/contexts/page-builder-context';
import TabBar from '@/components/tab-bar';
import { AddPageSectionModal, LayoutTab, PagePreview, PageSectionShelf, SettingsTab } from '@/components/admin/pages';
import ConfirmDialog from '@/components/confirm-dialog';
import AsyncWrapper from '@/components/async-page';
import { useNavigate, useParams } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';

const SHELF_TRANSITION_DURATION_MS = 600;

const useStyles = createUseThemedStyles((theme) => ({
	wrapper: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		position: 'fixed',
	},
	header: {
		top: 0,
		left: 0,
		right: 0,
		height: 60,
		zIndex: 3,
		display: 'flex',
		padding: '0 24px',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	aside: {
		top: 60,
		left: 0,
		bottom: 0,
		zIndex: 2,
		width: 376,
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	tabContent: {
		height: 'calc(100% - 57px)',
		'& .tab-pane': {
			height: '100%',
			overflowY: 'auto',
		},
	},
	asideShelf: {
		top: 60,
		left: 376,
		bottom: 0,
		width: 576,
		zIndex: 1,
		overflowX: 'hidden',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	previewPane: {
		top: 60,
		left: 376,
		right: 0,
		bottom: 0,
		zIndex: 0,
		padding: 24,
		overflowY: 'auto',
		position: 'absolute',
		backgroundColor: theme.colors.n75,
	},
	previewPage: {
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: theme.colors.n50,
		border: `1px solid ${theme.colors.n100}`,
	},
	'@global': {
		'.menu-animation-enter': {
			transform: 'translateX(-100%)',
		},
		'.menu-animation-enter-active': {
			transform: 'translateX(0)',
			transition: `opacity ${SHELF_TRANSITION_DURATION_MS}ms, transform ${SHELF_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.menu-animation-exit': {
			transform: 'translateX(0)',
		},
		'.menu-animation-exit-active': {
			transform: 'translateX(-100%)',
			transition: `opacity ${SHELF_TRANSITION_DURATION_MS}ms, transform ${SHELF_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
	},
}));

const PageBuilder = () => {
	const { pageId } = useParams<{ pageId: string }>();
	const classes = useStyles();
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const { page, setPage, setCurrentPageSectionId, currentPageSection, deletePageSection, isSaving, lastSaved } =
		usePageBuilderContext();
	const [currentTab, setCurrentTab] = useState('LAYOUT');
	const [showAddSectionModal, setShowAddSectionModal] = useState(false);
	const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
	const [showPublishModal, setShowPublishModal] = useState(false);

	const fetchData = useCallback(async () => {
		if (!pageId) {
			throw new Error('pageId is undefined.');
		}

		const response = await pagesService.getPage(pageId).fetch();
		setPage(response.page);
	}, [pageId, setPage]);

	const deleteCurrentSection = useCallback(async () => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			await pagesService.deletePageSection(currentPageSection.pageSectionId).fetch();

			deletePageSection(currentPageSection.pageSectionId);
			setCurrentPageSectionId('');
			setShowDeleteSectionModal(false);
		} catch (error) {
			handleError(error);
		}
	}, [currentPageSection, deletePageSection, handleError, setCurrentPageSectionId]);

	const handlePublishConfirm = useCallback(async () => {
		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const response = await pagesService.publishPage(page.pageId).fetch();

			navigate('/admin/pages');
			addFlag({
				variant: 'success',
				title: `${response.page.pageTypeId} page published.`,
				description: `Your page is now available on Cobalt.`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
		} finally {
			setShowPublishModal(false);
		}
	}, [addFlag, handleError, navigate, page]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<AddPageSectionModal
				show={showAddSectionModal}
				onHide={() => {
					setShowAddSectionModal(false);
				}}
			/>

			<ConfirmDialog
				show={showDeleteSectionModal}
				size="lg"
				titleText="Delete section"
				bodyText={`Are you sure you want to delete "${currentPageSection?.name ?? ''}"?`}
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				onHide={() => {
					setShowPublishModal(false);
				}}
				onConfirm={deleteCurrentSection}
			/>

			<ConfirmDialog
				show={showPublishModal}
				size="lg"
				titleText={`Publish ${page?.pageTypeId} Page`}
				bodyText={`Are you ready to publish ${page?.name} to Cobalt?`}
				detailText={
					<div className="mt-4">
						<p>This page will become live on Cobalt immediately at {page?.urlName}</p>
						<p className="mb-0">
							IMPORTANT: If you would like to make this page a featured page on the homescreen or include
							it in the main navigation, please contact Mark Allen at [TODO].
						</p>
					</div>
				}
				dismissText="Cancel"
				confirmText="Publish"
				onHide={() => {
					setShowPublishModal(false);
				}}
				onConfirm={handlePublishConfirm}
			/>

			<div className={classes.wrapper}>
				{/* path matching logic in components/admin/admin-header.tsx hides the default header */}
				<div className={classes.header}>
					<div className="d-flex align-items-center">
						<h5 className="mb-0 me-4">{page?.name}</h5>
						{page?.pageStatusId === PAGE_STATUS_ID.DRAFT && (
							<Badge pill bg="outline-dark" className="text-nowrap">
								Draft
							</Badge>
						)}
						{page?.pageStatusId === PAGE_STATUS_ID.LIVE && (
							<Badge pill bg="outline-success" className="text-nowrap">
								Live
							</Badge>
						)}
					</div>
					<div className="d-flex align-items-center">
						<span className="fw-semibold text-n500">{isSaving ? 'Saving...' : `Updated ${lastSaved}`}</span>
						<Button
							variant="link"
							className="text-decoration-none"
							onClick={() => {
								navigate(-1);
							}}
						>
							Finish Later
						</Button>
						<Button
							onClick={() => {
								setShowPublishModal(true);
							}}
						>
							Publish
						</Button>
					</div>
				</div>
				<div className={classes.aside}>
					<Tab.Container id="page-tabs" defaultActiveKey="LAYOUT" activeKey={currentTab}>
						<TabBar
							classNameInner="px-6"
							value={currentTab}
							tabs={[
								{
									title: 'Layout',
									value: 'LAYOUT',
								},
								{
									title: 'Settings',
									value: 'SETTINGS',
								},
							]}
							onTabClick={(tabValue) => {
								setCurrentTab(tabValue);
								setCurrentPageSectionId('');
							}}
						/>
						<Tab.Content className={classes.tabContent}>
							<Tab.Pane eventKey="LAYOUT">
								<LayoutTab
									onAddSectionButtonClick={() => {
										setCurrentPageSectionId('');
										setShowAddSectionModal(true);
									}}
								/>
							</Tab.Pane>
							<Tab.Pane eventKey="SETTINGS" mountOnEnter unmountOnExit>
								<div className="p-6">
									<SettingsTab />
								</div>
							</Tab.Pane>
						</Tab.Content>
					</Tab.Container>
				</div>
				<CSSTransition
					in={!!currentPageSection}
					timeout={SHELF_TRANSITION_DURATION_MS}
					classNames="menu-animation"
					mountOnEnter
					unmountOnExit
				>
					<div className={classes.asideShelf}>
						<PageSectionShelf
							onEditButtonClick={() => {
								setShowAddSectionModal(true);
							}}
							onDeleteButtonClick={() => {
								setShowDeleteSectionModal(true);
							}}
						/>
					</div>
				</CSSTransition>
				<div className={classes.previewPane}>
					<div className={classes.previewPage}>{page && <PagePreview page={page} />}</div>
				</div>
			</div>
		</AsyncWrapper>
	);
};

export async function loader() {
	return null;
}

export const Component = () => {
	return (
		<PageBuilderProvider>
			<PageBuilder />
		</PageBuilderProvider>
	);
};
