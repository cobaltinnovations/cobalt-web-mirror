import React from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	tabBar: {
		overflowX: 'auto',
		borderBottom: `1px solid ${theme.colors.n100}`,
		'& ul': {
			margin: 0,
			padding: 0,
			display: 'flex',
			listStyle: 'none',
			'& li': {
				position: 'relative',
				'& button': {
					border: 0,
					padding: 18,
					appearance: 'none',
					whiteSpace: 'nowrap',
					...theme.fonts.bodyBold,
					color: theme.colors.n500,
					backgroundColor: 'transparent',
				},
				'&.active': {
					'& button': {
						color: theme.colors.p700,
					},
					'&:after': {
						left: 18,
						right: 18,
						bottom: 0,
						height: 2,
						content: '""',
						position: 'absolute',
						backgroundColor: theme.colors.p700,
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
}

const TabBar = ({ value, tabs, onTabClick }: TabBarProps) => {
	const classes = useStyles();

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
