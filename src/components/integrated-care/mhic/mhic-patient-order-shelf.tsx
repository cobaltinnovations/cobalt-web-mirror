import { createUseThemedStyles } from '@/jss/theme';
import React, { useEffect } from 'react';
import { Badge, Button, Nav, Tab } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';

import useFlags from '@/hooks/use-flags';
import { MhicComments, MhicOutreachAndAssesment, MhicPatientDetails } from '@/components/integrated-care/mhic';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';

const useStyles = createUseThemedStyles((theme) => ({
	patientOrderShelf: {
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 6,
		width: '95%',
		maxWidth: 800,
		display: 'flex',
		position: 'fixed',
		overflow: 'hidden',
		flexDirection: 'column',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n50,
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.n100}`,
		},
	},
	overlay: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 5,
		cursor: 'pointer',
		position: 'fixed',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	header: {
		padding: '28px 32px 0',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
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
	'@global': {
		'.patient-order-shelf-enter': {
			opacity: 0.5,
			transform: 'translateX(100%)',
		},
		'.patient-order-shelf-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.patient-order-shelf-exit-active': {
			opacity: 0.5,
			transform: 'translateX(100%)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-overlay-enter': {
			opacity: 0,
		},
		'.patient-order-shelf-overlay-enter-active': {
			opacity: 1,
			transition: 'opacity 300ms',
		},
		'.patient-order-shelf-overlay-exit': {
			opacity: 1,
		},
		'.patient-order-shelf-overlay-exit-active': {
			opacity: 0,
			transition: 'opacity 300ms',
		},
	},
}));

interface MhicPatientOrderShelfProps {
	open: boolean;
	onHide(): void;
}

enum TAB_KEYS {
	PATIENT_DETAILS = 'PATIENT_DETAILS',
	OUTREACH_AND_ASSESSMENT = 'OUTREACH_AND_ASSESSMENT',
	COMMENTS = 'COMMENTS',
}

export const MhicPatientOrderShelf = ({ open, onHide }: MhicPatientOrderShelfProps) => {
	const classes = useStyles();
	const { addFlag } = useFlags();

	useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
			return;
		}

		document.body.style.overflow = 'visible';
	}, [open]);

	return (
		<>
			<CSSTransition in={open} timeout={300} classNames="patient-order-shelf" mountOnEnter unmountOnExit>
				<div className={classes.patientOrderShelf}>
					<Tab.Container id="shelf-tabs" defaultActiveKey={TAB_KEYS.PATIENT_DETAILS}>
						<div className={classes.header}>
							<Button
								variant="link"
								className={classNames(classes.shelfCloseButton, 'p-2 position-absolute')}
								onClick={onHide}
							>
								<CloseIcon />
							</Button>
							<div className="mb-2 d-flex align-items-center">
								<h4 className="mb-0 me-2">Lastname, FirstName</h4>
								<Badge pill bg="outline-primary">
									NEW
								</Badge>
							</div>
							<div className="d-flex align-items-center">
								<p className="mb-0">
									MRN: <span className="fw-bold">1A2B3C4D5E</span>
								</p>
								<CopyToClipboard
									onCopy={() => {
										addFlag({
											variant: 'success',
											title: 'Copied!',
											description: 'The MRN was copied to your clipboard',
											actions: [],
										});
									}}
									text="1A2B3C4D5E"
								>
									<Button variant="link" className="p-2">
										<CopyIcon width={20} height={20} />
									</Button>
								</CopyToClipboard>
							</div>
							<div>
								<Nav>
									<Nav.Item>
										<Nav.Link eventKey={TAB_KEYS.PATIENT_DETAILS}>Patient Details</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey={TAB_KEYS.OUTREACH_AND_ASSESSMENT}>
											Outreach &amp; Assessment
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey={TAB_KEYS.COMMENTS}>Comments</Nav.Link>
									</Nav.Item>
								</Nav>
							</div>
						</div>
						<Tab.Content className={classes.tabContent}>
							<Tab.Pane eventKey={TAB_KEYS.PATIENT_DETAILS} className={classes.tabPane}>
								<MhicPatientDetails />
							</Tab.Pane>
							<Tab.Pane eventKey={TAB_KEYS.OUTREACH_AND_ASSESSMENT} className={classes.tabPane}>
								<MhicOutreachAndAssesment />
							</Tab.Pane>
							<Tab.Pane eventKey={TAB_KEYS.COMMENTS} className={classes.commentsPane}>
								<MhicComments />
							</Tab.Pane>
						</Tab.Content>
					</Tab.Container>
				</div>
			</CSSTransition>
			<CSSTransition
				in={open}
				timeout={300}
				classNames="patient-order-shelf-overlay"
				onClick={onHide}
				mountOnEnter
				unmountOnExit
			>
				<div className={classes.overlay} />
			</CSSTransition>
		</>
	);
};
