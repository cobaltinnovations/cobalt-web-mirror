import React, { useCallback, useState } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { PageBuilderProvider } from '@/contexts/page-builder-context';
import { HERO_SECTION_ID, LayoutTab, PagePreview, PageSectionShelf } from '@/components/admin/pages';
import ConfirmDialog from '@/components/confirm-dialog';
import AsyncWrapper from '@/components/async-page';
import { useNavigate, useParams } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';
import { CobaltError } from '@/lib/http-client';
import classNames from 'classnames';
import SvgIcon from '@/components/svg-icon';

const headerHeight = 60;
const asideWidth = 344;
const asideWidthCollapsed = 60;
const shelfTransitionDurationMs = 600;

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
		height: headerHeight,
		zIndex: 3,
		display: 'flex',
		padding: '0 24px',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	headerLeft: {
		display: 'flex',
		alignItems: 'center',
		minWidth: 0,
	},
	menuToggle: {
		marginRight: 12,
	},
	aside: {
		top: headerHeight,
		left: 0,
		bottom: 0,
		zIndex: 2,
		overflow: 'hidden',
		position: 'absolute',
		width: asideWidthCollapsed,
		backgroundColor: theme.colors.n0,
		transition: '200ms width',
		borderRight: `1px solid ${theme.colors.n100}`,
		'& .aside-inner': {
			width: asideWidth,
			height: '100%',
			opacity: 0,
			pointerEvents: 'none',
			transition: '200ms opacity',
		},
		'&.show': {
			width: asideWidth,
			'& .aside-inner': {
				opacity: 1,
				pointerEvents: 'auto',
			},
		},
	},
	asideShelf: {
		top: headerHeight,
		left: asideWidth,
		bottom: 0,
		width: 576,
		zIndex: 1,
		overflowX: 'hidden',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	previewPane: {
		top: headerHeight,
		left: asideWidthCollapsed,
		right: 0,
		bottom: 0,
		zIndex: 0,
		padding: 24,
		overflowY: 'auto',
		position: 'absolute',
		transition: `left ${shelfTransitionDurationMs}ms cubic-bezier(.33,1,.33,1)`,
		backgroundColor: theme.colors.n75,
		'&.show': {
			left: asideWidth,
		},
	},
	previewControls: {
		display: 'flex',
		marginBottom: 16,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	previewToggle: {
		display: 'flex',
		gap: 12,
		alignItems: 'center',
		padding: '8px 12px',
		borderRadius: 999,
		border: `1px solid ${theme.colors.n100}`,
		backgroundColor: theme.colors.n0,
	},
	previewToggleLabel: {
		display: 'flex',
		gap: 8,
		alignItems: 'center',
		marginBottom: 0,
		color: theme.colors.n500,
		fontWeight: 600,
		transition: 'color 150ms ease',
	},
	previewToggleLabelActive: {
		color: theme.colors.n900,
	},
	previewToggleSwitch: {
		marginBottom: 0,
		'& .form-check-input': {
			cursor: 'pointer',
			width: 40,
			height: 22,
			marginTop: 0,
			borderColor: theme.colors.n300,
			backgroundColor: theme.colors.n300,
		},
		'& .form-check-input:focus': {
			borderColor: theme.colors.p500,
			boxShadow: `0 0 0 0.2rem ${theme.colors.p100}`,
		},
		'& .form-check-input:checked': {
			borderColor: theme.colors.p500,
			backgroundColor: theme.colors.p500,
		},
	},
	previewCanvas: {
		display: 'flex',
		justifyContent: 'center',
	},
	previewPage: {
		width: '100%',
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: theme.colors.n50,
		border: `1px solid ${theme.colors.n100}`,
	},
	previewPageMobile: {
		maxWidth: 430,
	},
	'@global': {
		'.menu-animation-enter': {
			transform: 'translateX(-100%)',
		},
		'.menu-animation-enter-active': {
			transform: 'translateX(0)',
			transition: `transform ${shelfTransitionDurationMs}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.menu-animation-exit': {
			transform: 'translateX(0)',
		},
		'.menu-animation-exit-active': {
			transform: 'translateX(-100%)',
			transition: `transform ${shelfTransitionDurationMs}ms cubic-bezier(.33,1,.33,1)`,
		},
	},
}));

const PageBuilder = () => {
	const { pageId } = useParams<{ pageId: string }>();
	const classes = useStyles();
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { addFlag } = useFlags();

	const {
		page,
		setPage,
		currentPageSection,
		setCurrentPageSectionId,
		setCurrentPageRowId,
		isSaving,
		setIsSaving,
		lastSaved,
	} = usePageBuilderContext();
	const [showMenu, setShowMenu] = useState(true);
	const [showPublishModal, setShowPublishModal] = useState(false);
	const [showUnpublishModal, setShowUnpublishModal] = useState(false);
	const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

	const fetchData = useCallback(async () => {
		if (!pageId) {
			throw new Error('pageId is undefined.');
		}

		const response = await pagesService.getPage(pageId).fetch();
		setPage(response.page);
		setCurrentPageSectionId('');
		setCurrentPageRowId('');
	}, [pageId, setCurrentPageRowId, setCurrentPageSectionId, setPage]);

	const handlePublishConfirm = useCallback(async () => {
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const response = await pagesService.publishPage(page.pageId).fetch();

			navigate('/admin/pages');
			addFlag({
				variant: 'success',
				title: `${response.page.name} page published.`,
				description: `Your page is now available on Cobalt.`,
				actions: [],
			});
		} catch (error) {
			if (error instanceof CobaltError && error.apiError) {
				const { metadata } = error.apiError;

				if (metadata?.pageId) {
					setCurrentPageSectionId(HERO_SECTION_ID);
				} else if (metadata?.sectionId && metadata?.rowId) {
					setCurrentPageSectionId(`${metadata.sectionId}`);
					setCurrentPageRowId(`${metadata.rowId}`);
				}
			}

			setShowPublishModal(false);
			handleError(error);
			setIsSaving(false);
		}
	}, [addFlag, handleError, navigate, page, setCurrentPageRowId, setCurrentPageSectionId, setIsSaving]);

	const handleUnpublish = useCallback(async () => {
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined.');
			}

			const response = await pagesService.unpublishPage(page.pageId).fetch();

			navigate('/admin/pages');
			addFlag({
				variant: 'success',
				title: `${response.page.name} page unpublished.`,
				description: `Your page is no longer available on Cobalt.`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
			setIsSaving(false);
		}
	}, [addFlag, handleError, navigate, page, setIsSaving]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<ConfirmDialog
				show={showUnpublishModal}
				size="lg"
				titleText="Unpublish Page"
				bodyText={`Are you sure you want to unpublish ${page?.name}?`}
				detailText={<p className="mt-2 mb-0">“{page?.name}” will be removed from Cobalt immediately.</p>}
				dismissText="Cancel"
				confirmText="Unpublish"
				destructive
				onHide={() => {
					setShowUnpublishModal(false);
				}}
				onConfirm={handleUnpublish}
			/>

			<ConfirmDialog
				show={showPublishModal}
				size="lg"
				titleText={page?.editingLivePage ? 'Publish Updates' : `Publish "${page?.name}" Page`}
				bodyText={
					page?.editingLivePage
						? 'Updates will be published to Cobalt immediately.'
						: `Are you ready to publish ${page?.name} to Cobalt?`
				}
				detailText={
					page?.editingLivePage ? undefined : (
						<div className="mt-4">
							<p>
								This page will become live on Cobalt immediately at {window.location.host}/pages/
								{page?.urlName}
							</p>
							<p className="mb-0">
								IMPORTANT: If you would like to make this page a featured page on the homescreen or
								include it in the main navigation, please contact{' '}
								<a href="mailto:support@cobaltinnovations.org">support@cobaltinnovations.org</a>
							</p>
						</div>
					)
				}
				dismissText="Cancel"
				confirmText={page?.editingLivePage ? 'Publish Updates' : 'Publish'}
				onHide={() => {
					setShowPublishModal(false);
				}}
				onConfirm={handlePublishConfirm}
			/>

			<div className={classes.wrapper}>
				<div className={classes.header}>
					<div className={classes.headerLeft}>
						<Button
							variant="light"
							className={classes.menuToggle}
							onClick={() => {
								setShowMenu((previousValue) => !previousValue);
							}}
						>
							<SvgIcon kit="fas" icon="bars" size={16} />
						</Button>
						<h5 className="mb-0 me-4 text-truncate">{page?.name}</h5>
						{page?.editingLivePage ? (
							<Badge pill bg="outline-success" className="text-nowrap">
								Live
							</Badge>
						) : (
							<Badge pill bg="outline-dark" className="text-nowrap">
								Draft
							</Badge>
						)}
					</div>
					<div className="d-flex align-items-center">
						<span className="fw-semibold text-n500">
							{isSaving
								? 'Saving...'
								: page?.editingLivePage
								? `Updates saved on ${lastSaved}`
								: `Draft saved on ${lastSaved}`}
						</span>
						{page?.editingLivePage && (
							<>
								<Button
									variant="link"
									className="text-decoration-none"
									onClick={() => {
										setShowUnpublishModal(true);
									}}
								>
									Unpublish
								</Button>
								<div className="vr me-4" />
							</>
						)}
						<Button
							variant={page?.editingLivePage ? 'outline-primary' : 'link'}
							className={page?.editingLivePage ? 'me-2' : 'text-decoration-none'}
							onClick={() => {
								navigate(-1);
							}}
						>
							{page?.editingLivePage ? 'Cancel Editing' : 'Finish Later'}
						</Button>
						<Button
							onClick={() => {
								setShowPublishModal(true);
							}}
						>
							{page?.editingLivePage ? 'Publish Updates' : 'Publish'}
						</Button>
					</div>
				</div>

				<div
					className={classNames(classes.aside, {
						show: showMenu,
					})}
				>
					<div className="aside-inner">
						<LayoutTab
							onAddRowButtonClick={() => {
								return;
							}}
						/>
					</div>
				</div>

				<CSSTransition
					in={showMenu && !!currentPageSection}
					timeout={shelfTransitionDurationMs}
					classNames="menu-animation"
					mountOnEnter
					unmountOnExit
				>
					<div className={classes.asideShelf}>
						<PageSectionShelf />
					</div>
				</CSSTransition>

				<div
					className={classNames(classes.previewPane, {
						show: showMenu,
					})}
				>
					<div className={classes.previewControls}>
						<h6 className="mb-0">Preview</h6>
						<div className={classes.previewToggle}>
							<div
								className={classNames(classes.previewToggleLabel, {
									[classes.previewToggleLabelActive]: previewViewport === 'desktop',
								})}
							>
								<SvgIcon kit="far" icon="desktop" size={16} />
								Desktop
							</div>
							<Form.Check
								type="switch"
								id="page-builder-preview-viewport"
								className={classes.previewToggleSwitch}
								aria-label="Toggle page preview viewport"
								checked={previewViewport === 'mobile'}
								onChange={({ currentTarget }) => {
									setPreviewViewport(currentTarget.checked ? 'mobile' : 'desktop');
								}}
							/>
							<div
								className={classNames(classes.previewToggleLabel, {
									[classes.previewToggleLabelActive]: previewViewport === 'mobile',
								})}
							>
								<SvgIcon kit="far" icon="mobile" size={16} />
								Mobile
							</div>
						</div>
					</div>
					<div className={classes.previewCanvas}>
						<div
							className={classNames(classes.previewPage, {
								[classes.previewPageMobile]: previewViewport === 'mobile',
							})}
						>
							{page && (
								<PagePreview page={page} enableAnalytics={false} previewViewport={previewViewport} />
							)}
						</div>
					</div>
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
