import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useState } from 'react';
import { Button, Form, Tab } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';

import { PageSectionModel } from '@/lib/models';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelper from '@/components/input-helper';
import { PageSectionShelf } from '@/components/admin/pages/page-section-shelf';
import classNames from 'classnames';

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
		position: 'absolute',
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
	sectionButton: {
		padding: 24,
		cursor: 'pointer',
		borderBottom: `1px solid ${theme.colors.n100}`,
		'&.active': {
			backgroundColor: theme.colors.n75,
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
	const [currentTab, setCurrentTab] = useState('LAYOUT');
	const [sections, setSections] = useState<PageSectionModel[]>([]);
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

	const handlePageSectionDelete = (section: PageSectionModel) => {
		setSections((previousValue) => previousValue.filter((s) => s.pageSectionId !== section.pageSectionId));
		setCurrentSection(undefined);
	};

	useEffect(() => {
		setCurrentSection(undefined);
	}, [currentTab]);

	return (
		<div className={classes.wrapper}>
			{/* path matching logic in components/admin/admin-header.tsx hides the default header */}
			<div className={classes.header}></div>
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
							{sections.map((section) => (
								<div
									key={section.pageSectionId}
									className={classNames(classes.sectionButton, {
										active: currentSection?.pageSectionId === section.pageSectionId,
									})}
									onClick={() => handleSectionClick(section)}
								>
									{section.name}
								</div>
							))}
							<div className="p-6 text-right">
								<Button variant="outline-primary" onClick={handleAddSectionButtonClick}>
									Add Section
								</Button>
							</div>
						</Tab.Pane>
						<Tab.Pane eventKey="SETTINGS">
							<div className="p-6">
								<Form>
									<InputHelper className="mb-6" type="text" label="Page name" required />
									<InputHelper type="url" label="Friendly url" required />
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
							onDelete={() => {
								handlePageSectionDelete(currentSection);
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
	);
};
