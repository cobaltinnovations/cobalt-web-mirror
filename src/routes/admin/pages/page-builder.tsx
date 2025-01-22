import React, { useCallback, useState } from 'react';
import { Badge, Button, Col, Container, Form, Row, Tab } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { BACKGROUND_COLOR_ID, PAGE_STATUS_ID, PageDetailModel, PageSectionDetailModel } from '@/lib/models';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';
import InputHelper from '@/components/input-helper';
import { AddPageSectionModal, LayoutTab, PageSectionShelf } from '@/components/admin/pages';
import { createUseThemedStyles } from '@/jss/theme';
import ConfirmDialog from '@/components/confirm-dialog';
import { useNavigate, useParams } from 'react-router-dom';
import { pagesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { cloneDeep } from 'lodash';

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

export async function loader() {
	return null;
}

export const Component = () => {
	const { pageId } = useParams<{ pageId: string }>();
	const classes = useStyles();
	const navigate = useNavigate();

	const [page, setPage] = useState<PageDetailModel>();
	const [currentTab, setCurrentTab] = useState('LAYOUT');
	const [showAddSectionModal, setShowAddSectionModal] = useState(false);
	const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
	const [currentSection, setCurrentSection] = useState<PageSectionDetailModel>();

	const fetchData = useCallback(async () => {
		if (!pageId) {
			throw new Error('pageId is undefined.');
		}

		const response = await pagesService.getPage(pageId).fetch();
		setPage(response.page);
	}, [pageId]);

	const deleteCurrentSection = () => {
		if (!currentSection) {
			throw new Error('currentSection is undefined');
		}

		window.alert('[TODO]: Delete Section');
	};

	const handleSectionAdd = (newSection: PageSectionDetailModel) => {
		if (!page) {
			return;
		}

		const pageClone = cloneDeep(page);
		pageClone.pageSections = [...pageClone.pageSections, newSection];

		setPage(pageClone);
		setCurrentSection(newSection);
		setShowAddSectionModal(false);
	};

	const handleSectionReorder = (updatedPageSections: PageSectionDetailModel[]) => {
		if (!page) {
			return;
		}

		const pageClone = cloneDeep(page);
		pageClone.pageSections = updatedPageSections;

		setPage(pageClone);
	};

	const handleSectionChange = (updatedPageSection: PageSectionDetailModel) => {
		if (!page) {
			return;
		}

		const pageClone = cloneDeep(page);
		pageClone.pageSections = pageClone.pageSections.map((ps) =>
			ps.pageSectionId === updatedPageSection.pageSectionId ? updatedPageSection : ps
		);

		setPage(pageClone);
		setCurrentSection((cs) => {
			if (!cs) {
				return undefined;
			}

			if (cs.pageSectionId === updatedPageSection.pageSectionId) {
				return updatedPageSection;
			}

			return cs;
		});
	};

	return (
		<AsyncWrapper fetchData={fetchData}>
			{page && (
				<AddPageSectionModal
					pageId={page.pageId}
					pageStatusId={page.pageStatusId}
					show={showAddSectionModal}
					onHide={() => {
						setShowAddSectionModal(false);
					}}
					onSave={handleSectionAdd}
				/>
			)}

			<ConfirmDialog
				show={showDeleteSectionModal}
				size="lg"
				titleText="Delete section"
				bodyText={`Are you sure you want to delete "${currentSection?.name ?? ''}"?`}
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				onHide={() => {
					setShowDeleteSectionModal(false);
				}}
				onConfirm={() => {
					deleteCurrentSection();
					setShowDeleteSectionModal(false);
				}}
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
								navigate(-1);
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
								setCurrentSection(undefined);
							}}
						/>
						<Tab.Content className={classes.tabContent}>
							<Tab.Pane eventKey="LAYOUT">
								{page && (
									<LayoutTab
										sections={page.pageSections}
										currentSection={currentSection}
										onSectionClick={setCurrentSection}
										onReorder={handleSectionReorder}
										onAddSectionClick={() => {
											setCurrentSection(undefined);
											setShowAddSectionModal(true);
										}}
									/>
								)}
							</Tab.Pane>
							<Tab.Pane eventKey="SETTINGS">
								<div className="p-6">
									<Form>
										<InputHelper className="mb-4" type="text" label="Page name" required />
										<InputHelper className="mb-4" type="url" label="Friendly url" required />
										<InputHelper
											as="select"
											label="Page Type"
											required
											helperText="The type determines where the content lives on Cobalt"
										/>
									</Form>
								</div>
							</Tab.Pane>
						</Tab.Content>
					</Tab.Container>
				</div>
				<CSSTransition
					in={!!currentSection}
					timeout={SHELF_TRANSITION_DURATION_MS}
					classNames="menu-animation"
					mountOnEnter
					unmountOnExit
				>
					<div className={classes.asideShelf}>
						{currentSection && (
							<PageSectionShelf
								pageSection={currentSection}
								onChange={handleSectionChange}
								onEditButtonClick={() => {
									setShowAddSectionModal(true);
								}}
								onDeleteButtonClick={() => {
									setShowDeleteSectionModal(true);
								}}
								onCloseButtonClick={() => {
									setCurrentSection(undefined);
								}}
							/>
						)}
					</div>
				</CSSTransition>
				<div className={classes.previewPane}>
					<div className={classes.previewPage}>
						<PageHeader
							className="bg-p700 text-white"
							title={<h1>[Hero.headline]</h1>}
							descriptionHtml="[Hero.description]"
							//imageUrl={topicCenter?.imageUrl}
							//imageAlt={topicCenter?.name}
						/>
						{(page?.pageSections ?? []).map((ps) => (
							<Container
								key={ps.pageSectionId}
								fluid
								className={ps.backgroundColorId === BACKGROUND_COLOR_ID.WHITE ? 'bg-white' : 'bg-n50'}
							>
								<Container>
									<Row>
										<Col>
											<sub>
												{ps.pageSectionId}: {ps.name}
											</sub>
											<h1>{ps.headline}</h1>
											<p>{ps.description}</p>
										</Col>
									</Row>
									{ps.pageRows.map((r) => (
										<Row key={r.pageRowId}>
											<Col>{r.pageRowId}</Col>
										</Row>
									))}
								</Container>
							</Container>
						))}
					</div>
				</div>
			</div>
		</AsyncWrapper>
	);
};
