import React from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	vertical: boolean;
	hideBorder: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	tabBar: ({ vertical, hideBorder }: UseStylesProps) => ({
		overflowX: vertical ? 'visible' : 'auto',
		...(vertical
			? { borderLeft: hideBorder ? '' : `1px solid ${theme.colors.n100}` }
			: { borderBottom: hideBorder ? '' : `1px solid ${theme.colors.n100}` }),

		'& ul': {
			margin: 0,
			padding: 0,
			display: 'flex',
			listStyle: 'none',
			flexDirection: vertical ? 'column' : 'row',
			'& li': {
				position: 'relative',
				'& button': {
					border: 0,
					fontWeight: 500,
					padding: vertical ? '10px 16px' : '18px 12px',
					appearance: 'none',
					whiteSpace: 'nowrap',
					color: theme.colors.n500,
					backgroundColor: 'transparent',
					'&:hover': {
						color: theme.colors.p700,
					},
				},
				'&.level-1': {
					paddingLeft: 16,
				},
				'&.active': {
					'& button': {
						color: theme.colors.p700,
					},
					'&:after': {
						content: '""',
						position: 'absolute',
						backgroundColor: theme.colors.p700,
						...(vertical
							? {
									top: 0,
									left: 0,
									bottom: 0,
									width: 2,
							  }
							: {
									left: 10,
									right: 10,
									bottom: 0,
									height: 2,
							  }),
					},
				},
				...(!vertical && {
					'&:first-child': {
						'& button': {
							paddingLeft: 0,
						},
						'&.active:after': {
							left: 0,
						},
					},
					'&:last-child': {
						'& button': {
							paddingRight: 0,
						},
						'&.active:after': {
							right: 0,
						},
					},
				}),
			},
		},
	}),
}));

interface TabBarProps {
	orientation?: 'horizontal' | 'vertical';
	value: string;
	tabs: { value: string; title: string; level?: number }[];
	onTabClick(value: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	hideBorder?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

const TabBar = ({ orientation = 'horizontal', value, tabs, onTabClick, hideBorder, className, style }: TabBarProps) => {
	const classes = useStyles({
		vertical: orientation === 'vertical',
		hideBorder: !!hideBorder,
	});

	return (
		<div className={classNames(classes.tabBar, className)} style={style}>
			<ul>
				{tabs.map((tab) => {
					return (
						<li
							key={tab.value}
							className={classNames({
								active: value === tab.value,
								[`level-${tab.level}`]: tab.level ?? 0,
							})}
						>
							<button
								onClick={(event) => {
									onTabClick(tab.value, event);
								}}
							>
								{tab.title}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default TabBar;
