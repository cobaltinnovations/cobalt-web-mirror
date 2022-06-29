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
		backgroundColor: Color(theme.colors.dark).alpha(0.12).string(),
		border: `1px solid ${theme.colors.dark}`,
		'&:focus': {
			outline: 'none',
		},
	},
	activePill: {
		backgroundColor: theme.colors.dark,
		color: theme.colors.white,
	},
	disabledPill: {
		backgroundColor: theme.colors.shadedPill,
		color: theme.colors.gray600,
	},
	arrowDown: {
		marginLeft: 2,
		marginTop: -1,
		fill: theme.colors.dark,
	},
	activeArrowDown: {
		fill: theme.colors.white,
	},
	disabledArrowDown: {
		fill: theme.colors.gray600,
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
