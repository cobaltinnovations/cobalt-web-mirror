import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	blurb: {
		display: 'flex',
		paddingBottom: 68,
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
		[mediaQueries.md]: {
			paddingBottom: 24,
			flexDirection: 'column',
		},
	},
	speechBubble: {
		width: 194,
		padding: '24px 16px',
		marginRight: 16,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n0,
		[mediaQueries.md]: {
			width: '100%',
			marginRight: 0,
			marginBottom: 8,
		},
	},
	headshot: {
		width: 88,
		height: 88,
		display: 'flex',
		borderRadius: '50%',
		border: `4px solid ${theme.colors.n0}`,
		backgroundSize: 'cover',
		transform: 'translateY(50%)',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n0,

		[mediaQueries.md]: {
			alignSelf: 'flex-end',
			transform: 'translateY(0%)',
		},
	},
	modal: {
		maxWidth: 628,
		'& .cobalt-modal__body': {
			paddingTop: 0,
		},
	},
	modalHeader: {
		border: 0,
		backgroundColor: 'transparent',
	},
}));

interface BlurbProps {
	modalTitle: string;
	modalDestription: string;
	speechBubbleTitle: string;
	speechBubbleDestription: string;
	teamMemberImageUrl: string;
}

const Blurb = ({
	modalTitle,
	modalDestription,
	speechBubbleTitle,
	speechBubbleDestription,
	teamMemberImageUrl,
}: BlurbProps) => {
	const classes = useStyles();
	const [showModal, setShowModal] = useState(false);

	return (
		<>
			<Modal
				show={showModal}
				dialogClassName={classes.modal}
				centered
				onHide={() => {
					setShowModal(false);
				}}
			>
				<Modal.Header className={classes.modalHeader} closeButton>
					<Modal.Title>&nbsp;</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h3 className="mb-6">{modalTitle}</h3>
					<div dangerouslySetInnerHTML={{ __html: modalDestription }} />
				</Modal.Body>
			</Modal>

			<div className={classes.blurb}>
				<div className={classes.speechBubble}>
					<h6 className="mb-4">{speechBubbleTitle}</h6>
					<p className="mb-4">{speechBubbleDestription}</p>
					<Button
						variant="link"
						size="sm"
						className="p-0"
						onClick={() => {
							setShowModal(true);
						}}
					>
						Read More
					</Button>
				</div>
				<div className={classes.headshot} style={{ backgroundImage: `url(${teamMemberImageUrl}` }} />
			</div>
		</>
	);
};

export default Blurb;
