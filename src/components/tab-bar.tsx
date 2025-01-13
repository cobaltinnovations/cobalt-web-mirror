import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { Link, To } from 'react-router-dom';

interface UseStylesProps {
	vertical: boolean;
	hideBorder: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	tabBar: {
		overflowX: ({ vertical }: UseStylesProps) => (vertical ? 'visible' : 'auto'),
		'& ul': {
			borderLeft: ({ vertical, hideBorder }: UseStylesProps) =>
				vertical && !hideBorder ? `1px solid ${theme.colors.border}` : '',
			borderBottom: ({ vertical, hideBorder }: UseStylesProps) =>
				!vertical && !hideBorder ? `1px solid ${theme.colors.border}` : '',
			margin: 0,
			padding: 0,
			display: 'flex',
			listStyle: 'none',
			flexDirection: ({ vertical }: UseStylesProps) => (vertical ? 'column' : 'row'),
			'& li': {
				position: 'relative',
				'& button, a': {
					display: 'block',
					textDecoration: 'none',
					border: 0,
					fontWeight: 500,
					padding: ({ vertical }: UseStylesProps) => (vertical ? '10px 16px' : '18px 12px'),
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
					'& button, a': {
						color: theme.colors.p700,
					},
					'&:after': {
						content: '""',
						position: 'absolute',
						backgroundColor: theme.colors.p700,
						left: ({ vertical }: UseStylesProps) => (vertical ? 0 : 10),
						top: ({ vertical }: UseStylesProps) => (vertical ? 10 : undefined),
						right: ({ vertical }: UseStylesProps) => (vertical ? undefined : 10),
						bottom: 0,
						height: ({ vertical }: UseStylesProps) => (vertical ? undefined : 2),
					},
				},
				'&:first-child': {
					'& button, a': {
						paddingLeft: ({ vertical }: UseStylesProps) => (vertical ? undefined : 0),
					},
					'&.active:after': {
						left: ({ vertical }: UseStylesProps) => (vertical ? undefined : 0),
					},
				},
				'&:last-child': {
					'& button, a': {
						paddingRight: ({ vertical }: UseStylesProps) => (vertical ? undefined : 0),
					},
					'&.active:after': {
						right: ({ vertical }: UseStylesProps) => (vertical ? undefined : 0),
					},
				},
			},
		},
	},
}));

interface TabBarProps {
	orientation?: 'horizontal' | 'vertical';
	value: string;
	tabs: { value: string; title: string; level?: number; to?: To }[];
	onTabClick?(value: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	hideBorder?: boolean;
	className?: string;
	classNameInner?: string;
	style?: React.CSSProperties;
}

const TabBar = ({
	orientation = 'horizontal',
	value,
	tabs,
	onTabClick,
	hideBorder,
	className,
	classNameInner,
	style,
	children,
}: PropsWithChildren<TabBarProps>) => {
	const classes = useStyles({
		vertical: orientation === 'vertical',
		hideBorder: !!hideBorder,
	});

	return (
		<div className={classNames(classes.tabBar, className)} style={style}>
			{children}
			<ul className={classNameInner}>
				{tabs.map((tab) => {
					return (
						<li
							key={tab.value}
							className={classNames({
								active: value === tab.value,
								[`level-${tab.level}`]: tab.level ?? 0,
							})}
						>
							{!!tab.to ? (
								<Link to={tab.to}>{tab.title}</Link>
							) : (
								<button
									type="button"
									onClick={(event) => {
										onTabClick?.(tab.value, event);
									}}
								>
									{tab.title}
								</button>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default TabBar;
