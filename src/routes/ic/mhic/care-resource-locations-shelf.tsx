import React, { useState } from 'react';
import { LoaderFunctionArgs, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Row, Tab } from 'react-bootstrap';
import classNames from 'classnames';
import TabBar from '@/components/tab-bar';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { careResourceService } from '@/lib/services';

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
	const { careResourceId } = params;

	if (!careResourceId) {
		throw new Error('resourceId is undefined.');
	}

	const { careResource } = await careResourceService.getCareResource(careResourceId).fetch();
	return { careResource };
};

export const Component = () => {
	const classes = useStyles();
	const location = useLocation();
	const navigate = useNavigate();
	const [tabKey, setTabKey] = useState(TAB_KEYS.RESOURCES_DETAILS);

	return (
		<Tab.Container
			id="resources-shelf-tabs"
			defaultActiveKey={TAB_KEYS.RESOURCES_DETAILS}
			activeKey={tabKey}
			mountOnEnter
			unmountOnExit
		>
			<div className={classes.header}>
				<Button
					variant="light"
					className={classNames(classes.shelfCloseButton, 'p-2 border-0 position-absolute')}
					onClick={() => {
						navigate({
							pathname: '..',
							search: location.search,
						});
					}}
				>
					<CloseIcon width={20} height={20} className="d-block" />
				</Button>
				<div className="mb-2 d-flex align-items-center">
					<h4 className="mb-0 me-2">Resource Name</h4>
					<Badge pill bg="outline-success">
						Available
					</Badge>
				</div>
				<div className="d-flex align-items-center">
					<p className="mb-0">
						Phone: <span className="fw-bold">+1 000-000-0000</span> | Website:{' '}
						<span className="fw-bold">www.website.com</span>
					</p>
				</div>
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
					<section>
						<Container fluid>
							<Row className="mb-6">
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Insurance</Card.Title>
										</Card.Header>
										<Card.Body>
											<p className="m-0">
												Highmark, BCBS, Quest, Anthem, Compsych, Horizon, Aetna, Magellan,
												United Behavioral, Optum, KHPE, IBC
											</p>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<Row className="mb-6">
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Specialties</Card.Title>
										</Card.Header>
										<Card.Body>
											<p className="m-0">
												Individual, Family, Group, Couples Therapy, Stress, Caregiver Stress,
												Addiction and Recovery Support, Relationship Issues, Depression,
												Anxiety, Eating Disorder
											</p>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<Row className="mb-6">
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Therapy Types</Card.Title>
										</Card.Header>
										<Card.Body>
											<p className="m-0">Psychiatry, Psychotherapy</p>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<Row>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Additional Information</Card.Title>
										</Card.Header>
										<Card.Body>
											<p className="m-0">
												There is a mandatory $99 enrollment + $39 monthly fee for the online
												system including same day appointments, 24-hour Q&A, etc. The fee for
												the online system is not covered by insurance and needs to be payed in
												addition to co-pay.
											</p>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</Container>
					</section>
					<section>
						<Container fluid>
							<Row>
								<Col>
									<h4 className="mb-0">
										Locations <span className="text-gray">(5)</span>
									</h4>
									<p>TODO: LOCATIONS</p>
								</Col>
							</Row>
						</Container>
					</section>
				</Tab.Pane>
				<Tab.Pane eventKey={TAB_KEYS.COMMENTS} className={classes.commentsPane}>
					TODO: Comments
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};
