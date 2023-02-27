import React from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	hideBorder: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	tabBar: {
		overflowX: 'auto',
		borderBottom: ({ hideBorder }: UseStylesProps) => (hideBorder ? '' : `1px solid ${theme.colors.n100}`),
		'& ul': {
			margin: 0,
			padding: 0,
			display: 'flex',
			listStyle: 'none',
			'& li': {
				position: 'relative',
				'& button': {
					border: 0,
					fontWeight: 500,
					padding: '18px 10px',
					appearance: 'none',
					whiteSpace: 'nowrap',
					color: theme.colors.n500,
					backgroundColor: 'transparent',
					'&:hover': {
						color: theme.colors.p700,
					},
				},
				'&.active': {
					'& button': {
						color: theme.colors.p700,
					},
					'&:after': {
						left: 10,
						right: 10,
						bottom: 0,
						height: 2,
						content: '""',
						position: 'absolute',
						backgroundColor: theme.colors.p700,
					},
				},
				'&:first-child': {
					'& button': {
						paddingLeft: ({ hideBorder }: UseStylesProps) => (hideBorder ? 0 : 10),
					},
					'&.active:after': {
						left: ({ hideBorder }: UseStylesProps) => (hideBorder ? 0 : 10),
					},
				},
				'&:last-child': {
					'& button': {
						paddingRight: ({ hideBorder }: UseStylesProps) => (hideBorder ? 0 : 10),
					},
					'&.active:after': {
						right: ({ hideBorder }: UseStylesProps) => (hideBorder ? 0 : 10),
					},
				},
			},
		},
	},
}));

interface TabBarProps {
	value: string;
	tabs: { value: string; title: string }[];
	onTabClick(value: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	hideBorder?: boolean;
}

const TabBar = ({ value, tabs, onTabClick, hideBorder }: TabBarProps) => {
	const classes = useStyles({
		hideBorder: !!hideBorder,
	});

	return (
		<div className={classes.tabBar}>
			<ul>
				{tabs.map((tab) => {
					return (
						<li key={tab.value} className={classNames({ active: value === tab.value })}>
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
