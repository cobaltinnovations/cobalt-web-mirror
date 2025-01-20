import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useState } from 'react';
import { Badge, Button, Form, Tab } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { PageSectionModel } from '@/lib/models';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';
import InputHelper from '@/components/input-helper';
import { AddPageSectionModal, LayoutTab, PageSectionShelf } from '@/components/admin/pages';
import { createUseThemedStyles } from '@/jss/theme';
import ConfirmDialog from '@/components/confirm-dialog';
import { useNavigate } from 'react-router-dom';

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
	const classes = useStyles();
	const navigate = useNavigate();
	const [currentTab, setCurrentTab] = useState('LAYOUT');
	const [sections, setSections] = useState<PageSectionModel[]>([]);
	const [showAddSectionModal, setShowAddSectionModal] = useState(false);
	const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
	const [currentSection, setCurrentSection] = useState<PageSectionModel>();

	const handleAddSectionButtonClick = () => {
		const newSection = {
			pageSectionId: uuidv4(),
			pageId: 'xxxx-xxxx-xxxx-xxxx',
			name: 'Untitled Section',
			headline: '',
			description: '',
			backgroundColorId: '',
			displayOrder: sections.length,
		};

		setSections((previousValue) => [...previousValue, newSection]);
		setCurrentSection(newSection);
	};

	const handleSectionClick = (section: PageSectionModel) => {
		setCurrentSection(section);
	};

	const deleteCurrentSection = () => {
		if (!currentSection) {
			throw new Error('currentSection is undefined');
		}

		setSections((previousValue) => previousValue.filter((s) => s.pageSectionId !== currentSection.pageSectionId));
		setCurrentSection(undefined);
	};

	useEffect(() => {
		setCurrentSection(undefined);
	}, [currentTab]);

	return (
		<>
			<AddPageSectionModal
				show={showAddSectionModal}
				onHide={() => {
					setShowAddSectionModal(false);
				}}
				onSave={() => {
					handleAddSectionButtonClick();
					setShowAddSectionModal(false);
				}}
			/>

			<ConfirmDialog
				show={showDeleteSectionModal}
				size="lg"
				titleText="Delete section"
				bodyText="Are you sure you want to delete {Section Name}?"
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
						<h5 className="mb-0 me-4">Page Name</h5>
						<Badge pill bg="outline-dark">
							Draft
						</Badge>
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
							onTabClick={setCurrentTab}
						/>
						<Tab.Content className={classes.tabContent}>
							<Tab.Pane eventKey="LAYOUT">
								<LayoutTab
									sections={sections}
									onSectionClick={handleSectionClick}
									onAddSection={() => {
										setCurrentSection(undefined);
										setShowAddSectionModal(true);
									}}
								/>
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
								onEdit={() => {
									setShowAddSectionModal(true);
								}}
								onDelete={() => {
									setShowDeleteSectionModal(true);
								}}
								onClose={() => {
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
							title={
								<>
									<p className="fs-large">Community</p>
									<h1>Name</h1>
								</>
							}
							descriptionHtml="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed placerat
											consectetur magna, a pretium purus mattis et. Proin sagittis ex a faucibus
											pellentesque. Sed posuere neque vel elementum rutrum. Vivamus faucibus
											blandit nibh ut sodales. Quisque at enim fringilla, fringilla massa sed,
											porttitor lectus. Morbi ut aliquam purus, sit amet interdum massa. Etiam ac
											maximus ante. In fermentum dolor in aliquam venenatis. Sed sit amet laoreet
											ante."
							//imageUrl={topicCenter?.imageUrl}
							//imageAlt={topicCenter?.name}
						/>
					</div>
				</div>
			</div>
		</>
	);
};
