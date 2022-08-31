import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useFilterPillStyles = createUseThemedStyles((theme) => ({
	pill: {
		margin: 4,
		borderRadius: 500,
		appearance: 'none',
		whiteSpace: 'nowrap',
		...theme.fonts.small,
		...theme.fonts.bodyBold,
		color: theme.colors.p500,
		padding: '6px 5px 4px 14px',
		backgroundColor: 'transparent',
		border: `2px solid ${theme.colors.p500}`,
		'&:focus': {
			outline: 'none',
		},
		'&:hover': {
			color: theme.colors.n0,
			backgroundColor: theme.colors.p500,
		},
	},
	activePill: {
		color: theme.colors.n0,
		borderColor: theme.colors.p700,
		backgroundColor: theme.colors.p700,
		'&:hover': {
			borderColor: theme.colors.p500,
			backgroundColor: theme.colors.p500,
		},
	},
	disabledPill: {
		color: theme.colors.n500,
		borderColor: theme.colors.n100,
		backgroundColor: theme.colors.n100,
		'&:hover': {
			cursor: 'not-allowed',
			color: theme.colors.n500,
			backgroundColor: theme.colors.n100,
		},
	},
	arrowDown: {
		marginLeft: 2,
		marginTop: -2,
	},
	disabledArrowDown: {
		fill: theme.colors.n500,
	},
}));

interface FilterPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	active: boolean;
}

const FilterPill = React.forwardRef<HTMLButtonElement, FilterPillProps>(
	({ children, className, active, ...props }, ref) => {
		const classes = useFilterPillStyles();

		return (
			<button
				ref={ref}
				className={classNames(classes.pill, className, {
					[classes.activePill]: active,
					[classes.disabledPill]: props.disabled,
				})}
				{...props}
			>
				{children}
				<ArrowDown
					className={classNames(classes.arrowDown, {
						[classes.disabledArrowDown]: props.disabled,
					})}
				/>
			</button>
		);
	}
);

export default FilterPill;
