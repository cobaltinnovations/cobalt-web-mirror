import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import { Button, Form, Tab } from 'react-bootstrap';
import { PageSectionModel } from '@/lib/models';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelper from '@/components/input-helper';

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
		zIndex: 1,
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	aside: {
		top: 60,
		left: 0,
		bottom: 0,
		width: 376,
		zIndex: 1,
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	previewPane: {
		top: 60,
		left: 376,
		right: 0,
		bottom: 0,
		zIndex: 1,
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
}));

export async function loader() {
	return null;
}

export const Component = () => {
	const classes = useStyles();
	const [currentTab, setCurrentTab] = useState('LAYOUT');
	const [sections, setSections] = useState<PageSectionModel[]>([]);

	const handleAddSectionButtonClick = () => {
		setSections((previousValue) => [
			...previousValue,
			{
				pageSectionId: uuidv4(),
				pageId: 'xxxx-xxxx-xxxx-xxxx',
				name: 'Untitled Section',
				headline: '',
				description: '',
				backgroundColorId: '',
				displayOrder: previousValue.length,
			},
		]);
	};

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
					<Tab.Content>
						<Tab.Pane eventKey="LAYOUT">
							{sections.map((section) => (
								<div key={section.pageSectionId} className="p-6 border-bottom">
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
