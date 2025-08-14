import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ScreeningAnswersCorrectnessIndicatorId, ScreeningAnswersDisplayTypeId } from '@/lib/models';

import dragIndicator from '@/assets/icons/drag-indicator.svg';
import checkCircleFill from '@/assets/icons/screening-v2/check-circle-fill.svg';
import cancelFill from '@/assets/icons/screening-v2/cancel-fill.svg';

const useStyles = createUseThemedStyles((theme) => ({
	cardDraggable: {
		padding: 16,
		display: 'flex',
		borderRadius: 4,
		position: 'relative',
		alignItems: 'center',
		backgroundColor: theme.colors.n0,
		'&:after': {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			content: '""',
			borderRadius: 4,
			position: 'absolute',
			pointerEvents: 'none',
			border: `1px solid ${theme.colors.n100}`,
		},
		'& .drag-handle': {
			width: 24,
			height: 24,
			maskSize: 24,
			maskPosition: 'center',
			maskRepeat: 'no-repeat',
			maskImage: `url(${dragIndicator})`,
			backgroundColor: theme.colors.n500,
		},
		'&.correct .drag-handle': {
			maskSize: 20,
			maskImage: `url(${checkCircleFill})`,
			backgroundColor: theme.colors.s500,
		},
		'&.incorrect .drag-handle': {
			maskSize: 20,
			maskImage: `url(${cancelFill})`,
			backgroundColor: theme.colors.n500,
		},
		'&.success:after': {
			borderWidth: 2,
			borderColor: theme.colors.s500,
		},
		'&.danger:after': {
			borderWidth: 2,
			borderColor: theme.colors.d500,
		},
	},
}));

interface ItemDraggableProps {
	cardId: string;
	cardIndex: number;
	cardText: string;
	className?: string;
	variant?: ScreeningAnswersDisplayTypeId;
	correctnessIndicatorId?: ScreeningAnswersCorrectnessIndicatorId;
	disabled?: boolean;
}

export const ItemDraggable = ({
	cardId,
	cardIndex,
	cardText,
	className,
	variant,
	correctnessIndicatorId,
	disabled,
}: ItemDraggableProps) => {
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
							[`${variant?.toLocaleLowerCase()}`]: !!variant,
							[`${correctnessIndicatorId?.toLocaleLowerCase()}`]: !!correctnessIndicatorId,
						},
						className
					)}
					{...draggableProvided.dragHandleProps}
				>
					<div className="drag-handle" />
					<p className="mb-0 ms-2">{cardText}</p>
				</div>
			)}
		</Draggable>
	);
};
