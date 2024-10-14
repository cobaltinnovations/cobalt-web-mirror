import React, { useState } from 'react';
import { LoaderFunctionArgs } from 'react-router-dom';
import { Tab } from 'react-bootstrap';
import TabBar from '@/components/tab-bar';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		padding: '28px 32px 0',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	shelfCloseButton: {
		top: 20,
		right: 24,
	},

	tabContent: {
		flex: 1,
		overflow: 'hidden',
	},
	tabPane: {
		height: '100%',
		overflowY: 'auto',
	},
	commentsPane: {
		height: '100%',
	},
}));

enum TAB_KEYS {
	RESOURCES_DETAILS = 'RESOURCES_DETAILS',
	COMMENTS = 'COMMENTS',
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const resourceId = params.resourceId;

	if (!resourceId) {
		throw new Error('resourceId is undefined.');
	}

	return null;
};

export const Component = () => {
	const classes = useStyles();
	const [tabKey, setTabKey] = useState(TAB_KEYS.RESOURCES_DETAILS);

	return (
		<Tab.Container
			id="shelf-tabs"
			defaultActiveKey={TAB_KEYS.RESOURCES_DETAILS}
			activeKey={tabKey}
			mountOnEnter
			unmountOnExit
		>
			<div className={classes.header}>
				<TabBar
					key="resources-shelf-tabbar"
					hideBorder
					value={tabKey}
					tabs={[
						{ value: TAB_KEYS.RESOURCES_DETAILS, title: 'Resources Details' },
						{ value: TAB_KEYS.COMMENTS, title: 'Comments' },
					]}
					onTabClick={(value) => {
						setTabKey(value as TAB_KEYS);
					}}
				/>
			</div>
			<Tab.Content className={classes.tabContent}>
				<Tab.Pane eventKey={TAB_KEYS.RESOURCES_DETAILS} className={classes.tabPane}>
					TODO: Resource Details
				</Tab.Pane>
				<Tab.Pane eventKey={TAB_KEYS.COMMENTS} className={classes.commentsPane}>
					TODO: Comments
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};
