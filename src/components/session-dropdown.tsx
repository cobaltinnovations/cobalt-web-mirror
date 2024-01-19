import React, { FC, ReactElement, PropsWithChildren } from 'react';
import { Dropdown } from 'react-bootstrap';

import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	sessionToggle: {
		border: 0,
		width: 44,
		height: 44,
		padding: 0,
		borderRadius: 0,
		appearance: 'none',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		'&:after, &:before': {
			display: 'none !important',
		},
	},
	icon: {
		fill: theme.colors.n900,
	},
	sessionMenu: {
		width: 180,
		borderRadius: 0,
		padding: '16px 0',
		border: `2px solid ${theme.colors.border}`,
	},
	sessionItem: {
		display: 'flex',
		padding: '8px 24px',
		alignItems: 'center',
		textDecoration: 'none',
	},
	sessionItemIcon: {
		width: 24,
		height: 24,
		display: 'flex',
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

interface SessionToggleProps extends PropsWithChildren {
	id: string;
	className?: string;
	onClick?(event: React.MouseEvent): void;
}

const SessionToggle: FC<SessionToggleProps> = React.forwardRef(({ children, className, id, onClick }, ref) => {
	function handleSessionToggleClick(event: React.MouseEvent) {
		event.preventDefault();

		if (onClick) {
			onClick(event);
		}
	}

	return (
		// @ts-ignore
		<button ref={ref} id={id} className={className} onClick={handleSessionToggleClick}>
			{children}
		</button>
	);
});

interface SessionMenuProps extends PropsWithChildren {
	style?: any;
	className?: string;
	'aria-labelledby'?: string;
}

const SessionMenu: FC<SessionMenuProps> = React.forwardRef(
	({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
		return (
			// @ts-ignore
			<div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
				<ul className="m-0 list-unstyled">{children}</ul>
			</div>
		);
	}
);

interface SessionItem {
	icon: ReactElement;
	title: string;
	onClick: () => void;
}

interface SessionDropdownProps {
	id: string;
	items: SessionItem[];
}

const SessionDropdown: FC<SessionDropdownProps> = ({ id, items }) => {
	const classes = useStyles();

	return (
		<Dropdown drop="start">
			<Dropdown.Toggle as={SessionToggle} id={id} className={classes.sessionToggle}>
				<MoreIcon className={classes.icon} />
			</Dropdown.Toggle>
			<Dropdown.Menu as={SessionMenu} className={classes.sessionMenu}>
				{items.map((item, index) => {
					return (
						<Dropdown.Item
							key={`${item.title}-${index}`}
							className={classes.sessionItem}
							onClick={item.onClick}
						>
							<div className={classes.sessionItemIcon}>{item.icon}</div>
							<span className="fs-default">{item.title}</span>
						</Dropdown.Item>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default SessionDropdown;
