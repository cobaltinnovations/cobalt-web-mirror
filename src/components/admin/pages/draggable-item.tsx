import React from 'react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DragIndicator } from '@/assets/icons/drag-indicator.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

interface UseStylesProps {
	clickable?: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	sectionItem: {
		display: 'flex',
		alignItems: 'center',
		background: theme.colors.n0,
		transition: '0.3s background-color',
		'&:hover': {
			backgroundColor: ({ clickable }: UseStylesProps) => (clickable ? theme.colors.n50 : theme.colors.n0),
		},
		'&.active': {
			backgroundColor: theme.colors.n75,
		},
	},
	handleOuter: {
		padding: 16,
		flexShrink: 0,
	},
	sectionButton: {
		flex: 1,
		border: 0,
		minWidth: 0,
		display: 'flex',
		textAlign: 'left',
		appearance: 'none',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '16px 16px 16px 0',
		backgroundColor: 'transparent',
		cursor: ({ clickable }: UseStylesProps) => (clickable ? 'pointer' : 'default'),
	},
}));

interface DraggableItemProps {
	draggableProvided: DraggableProvided;
	draggableSnapshot: DraggableStateSnapshot;
	title: string;
	subTitle?: string;
	active?: boolean;
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	aside?: JSX.Element | null;
}

export const DraggableItem = ({
	draggableProvided,
	draggableSnapshot,
	title,
	subTitle,
	active,
	onClick,
	aside,
}: DraggableItemProps) => {
	const classes = useStyles({ clickable: !!onClick });

	return (
		<div
			ref={draggableProvided.innerRef}
			className={classNames(classes.sectionItem, {
				active,
				'shadow-lg': draggableSnapshot.isDragging,
				'border-bottom': !draggableSnapshot.isDragging,
				rounded: draggableSnapshot.isDragging,
			})}
			{...draggableProvided.draggableProps}
		>
			<div className={classes.handleOuter} {...draggableProvided.dragHandleProps}>
				<DragIndicator className="text-gray" />
			</div>
			{onClick ? (
				<button type="button" className={classes.sectionButton} onClick={onClick}>
					<span className="text-truncate">{title}</span>
					<div className="d-flex flex-shrink-0 align-items-center">
						<span className="text-n500">{subTitle}</span>
						<RightChevron className="text-n500" />
					</div>
				</button>
			) : (
				<div className={classes.sectionButton}>
					<span className="text-truncate">{title}</span>
					<div className="d-flex flex-shrink-0 align-items-center">
						<span className="text-n500">{subTitle}</span>
						{aside}
					</div>
				</div>
			)}
		</div>
	);
};
