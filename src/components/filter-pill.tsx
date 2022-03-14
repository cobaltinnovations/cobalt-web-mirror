import React, { ButtonHTMLAttributes } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import Color from 'color';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';

const useFilterPillStyles = createUseStyles({
	pill: {
		margin: 5,
		...fonts.xxs,
		borderRadius: 500,
		appearance: 'none',
		whiteSpace: 'nowrap',
		...fonts.karlaRegular,
		textTransform: 'uppercase',
		padding: '4px 10px 4px 12px',
		backgroundColor: Color(colors.dark).alpha(0.12).string(),
		border: `1px solid ${colors.dark}`,
		'&:focus': {
			outline: 'none',
		},
	},
	activePill: {
		backgroundColor: colors.dark,
		color: colors.white,
	},
	disabledPill: {
		backgroundColor: colors.shadedPill,
		color: colors.gray600,
	},
	arrowDown: {
		marginLeft: 2,
		marginTop: -1,
		fill: colors.dark,
	},
	activeArrowDown: {
		fill: colors.white,
	},
	disabledArrowDown: {
		fill: colors.gray600,
	},
});

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
