import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';

const useStyles = createUseThemedStyles((theme) => ({
	cardDraggable: {
		zIndex: 1,
		padding: 16,
		width: '100%',
		height: '100%',
		borderRadius: 4,
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	dragHandleOuter: {
		bottom: 16,
		left: '50%',
		position: 'absolute',
		transform: 'translateX(-50%)',
	},
}));

interface CardDraggableProps {
	cardId?: string;
	cardIndex: number;
	cardText?: string;
	className?: string;
	disabled?: boolean;
	onMouseDown?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}

export const CardDraggable = ({
	cardId,
	cardIndex,
	cardText,
	className,
	disabled,
	onMouseDown,
}: CardDraggableProps) => {
	const classes = useStyles();

	if (!cardId) {
		return null;
	}

	return (
		<Draggable draggableId={cardId} index={cardIndex} isDragDisabled={disabled}>
			{(draggableProvided, draggableSnapshot) => (
				<div
					ref={draggableProvided.innerRef}
					{...draggableProvided.draggableProps}
					{...draggableProvided.dragHandleProps}
					className={classNames(
						classes.cardDraggable,
						{
							'shadow-lg': draggableSnapshot.isDragging,
						},
						className
					)}
					onMouseDown={onMouseDown}
				>
					<p className="text-center">{cardText}</p>
					<div className={classes.dragHandleOuter}>
						<DragIndicator className="text-gray" />
					</div>
				</div>
			)}
		</Draggable>
	);
};
