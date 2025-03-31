import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';

const useStyles = createUseThemedStyles((theme) => ({
	cardDraggable: {
		padding: 16,
		display: 'flex',
		borderRadius: 4,
		position: 'relative',
		alignItems: 'center',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
}));

interface ItemDraggableProps {
	cardId: string;
	cardIndex: number;
	cardText: string;
	className?: string;
}

export const ItemDraggable = ({ cardId, cardIndex, cardText, className }: ItemDraggableProps) => {
	const classes = useStyles();
	return (
		<Draggable draggableId={cardId} index={cardIndex}>
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
					<div {...draggableProvided.dragHandleProps}>
						<DragIndicator className="text-gray" />
					</div>
					<p className="mb-0 ms-2">{cardText}</p>
				</div>
			)}
		</Draggable>
	);
};
