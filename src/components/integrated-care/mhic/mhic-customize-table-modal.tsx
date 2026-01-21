import { cloneDeep } from 'lodash';
import React, { FC, PropsWithChildren, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import {
	DragDropContext,
	Draggable,
	DraggableProvided,
	DraggableStateSnapshot,
	Droppable,
	DropResult,
} from '@hello-pangea/dnd';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		maxWidth: 480,
	},
	draggable: {
		padding: 16,
		display: 'flex',
		borderRadius: 4,
		marginBottom: 12,
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
		'&.is-dragging': {
			boxShadow: theme.elevation.e200,
		},
	},
}));

interface Props extends ModalProps {
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicCustomizeTableModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [columns, setColumns] = useState([
		{
			id: 'REFERRAL_DATE',
			title: 'Referral Date',
		},
		{
			id: 'PRACTICE',
			title: 'Practice',
		},
		{
			id: 'REFERRAL_REASON',
			title: 'Referral Reason',
		},
		{
			id: 'STATUS',
			title: 'Status',
		},
		{
			id: 'OUTREACH_ATTEMPTS',
			title: 'Outreach Attempts',
		},
		{
			id: 'LAST_OUTREACH_DATE',
			title: 'Last Outreach Date',
		},
		{
			id: 'EPISODE_LENGTH',
			title: 'Episode Length',
		},
		{
			id: 'SCHEDULED_ASSESSMENT_DATE',
			title: 'Scheduled Assessment Date',
		},
	]);

	const handleOnEnter = useCallback(() => {
		//TODO: Set <select/> values to Patient's values
	}, []);

	const handleDragEnd = useCallback(
		(result: DropResult) => {
			if (!result.destination) {
				return;
			}

			if (result.destination.index === result.source.index) {
				return;
			}

			const columnsClone = cloneDeep(columns);
			const [removed] = columnsClone.splice(result.source.index, 1);
			columnsClone.splice(result.destination.index, 0, removed);

			setColumns(columnsClone);
		},
		[columns]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Customize Table View</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="list">
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								{columns.map((column, columnIndex) => {
									return (
										<Draggable key={column.id} draggableId={column.id} index={columnIndex}>
											{(provided, snapshot) => (
												<PortalAwareItem
													provided={provided}
													snapshot={snapshot}
													className={classNames(classes.draggable, {
														'is-dragging': snapshot.isDragging,
													})}
												>
													<div>
														<p className="mb-0">{column.title}</p>
													</div>
													<div {...provided.dragHandleProps}>
														<SvgIcon kit="far" icon="grip-lines" size={20} />
													</div>
												</PortalAwareItem>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

// Need to render the dragged item in a portal,
// otherwise the item's position will be offset relative to the modal
const portal = document.createElement('div');
document.body.appendChild(portal);

// Component for the portal aware item
const PortalAwareItem = ({
	provided,
	snapshot,
	className,
	children,
}: PropsWithChildren<{
	provided: DraggableProvided;
	snapshot: DraggableStateSnapshot;
	className?: string;
}>) => {
	const usePortal = snapshot.isDragging;
	const child = (
		<div ref={provided.innerRef} className={className} {...provided.draggableProps}>
			{children}
		</div>
	);

	if (!usePortal) {
		return child;
	}

	return ReactDOM.createPortal(child, portal);
};
