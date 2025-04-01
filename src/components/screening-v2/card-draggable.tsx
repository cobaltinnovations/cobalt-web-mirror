import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';

const useStyles = createUseThemedStyles((theme) => ({
	cardDraggable: {
		padding: 16,
		width: '100%',
		height: '100%',
		borderRadius: 4,
		position: 'relative',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
}));

interface CardDraggableProps {
	cardId: string;
	cardIndex: number;
	cardText: string;
	className?: string;
	disabled?: boolean;
}

export const CardDraggable = ({ cardId, cardIndex, cardText, className, disabled }: CardDraggableProps) => {
	const classes = useStyles();
	return (
		<Draggable draggableId={cardId} index={cardIndex} isDragDisabled={disabled}>
			{(draggableProvided, draggableSnapshot) => (
				<div
					ref={draggableProvided.innerRef}
					{...draggableProvided.draggableProps}
					className={classNames(
						classes.cardDraggable,
						{
							'shadow-lg': draggableSnapshot.isDragging,
						},
						className
					)}
				>
					<p className="text-center">{cardText}</p>
					<div className="d-flex align-items-center justify-content-center">
						<div {...draggableProvided.dragHandleProps}>
							<DragIndicator className="text-gray" />
						</div>
					</div>
				</div>
			)}
		</Draggable>
	);
};
