import React, { FC, PropsWithChildren, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import colors from '@/jss/colors';

import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';

const useStyles = createUseStyles({
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
		fill: colors.dark,
	},
	sessionMenu: {
		width: 180,
		borderRadius: 0,
		padding: '16px 0',
		border: `2px solid ${colors.border}`,
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
});

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

interface ContentItem {
	icon: ReactElement;
	title: string;
	onClick: () => void;
}

interface ContentDropdownProps {
	id: string;
	items: ContentItem[];
}

const ContentDropdown: FC<ContentDropdownProps> = ({ id, items }) => {
	const classes = useStyles();

	return (
		<Dropdown drop="left">
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
							<span className="font-size-xs">{item.title}</span>
						</Dropdown.Item>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default ContentDropdown;
