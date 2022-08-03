import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import Color from 'color';

import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useFilterPillStyles = createUseThemedStyles((theme) => ({
	pill: {
		margin: 5,
		...theme.fonts.small,
		borderRadius: 500,
		appearance: 'none',
		whiteSpace: 'nowrap',
		...theme.fonts.bodyNormal,
		textTransform: 'uppercase',
		padding: '4px 10px 4px 12px',
		backgroundColor: theme.colors.n100,
		border: `1px solid ${theme.colors.border}`,
		'&:focus': {
			outline: 'none',
		},
	},
	activePill: {
		backgroundColor: theme.colors.n900,
		color: theme.colors.n0,
	},
	disabledPill: {
		backgroundColor: theme.colors.n100,
		color: theme.colors.n500,
		'&:hover': {
			cursor: 'not-allowed',
		},
	},
	arrowDown: {
		marginLeft: 2,
		marginTop: -1,
		fill: theme.colors.n900,
	},
	activeArrowDown: {
		fill: theme.colors.n0,
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
						[classes.activeArrowDown]: active,
						[classes.disabledArrowDown]: props.disabled,
					})}
				/>
			</button>
		);
	}
);

export default FilterPill;
