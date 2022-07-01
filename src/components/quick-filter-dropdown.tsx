import React, { FC, PropsWithChildren } from 'react';
import { Dropdown, FormCheck } from 'react-bootstrap';

import FilterPill from '@/components/filter-pill';

import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	quickFilterToggle: {
		'&:after': {
			display: 'none !important',
		},
	},
	quickFilterMenu: {
		width: 284,
		borderRadius: 0,
		padding: '24px 0 20px',
		border: `2px solid ${theme.colors.border}`,
	},
	quickFilterHeader: {
		...theme.fonts.large,
		marginBottom: 15,
		padding: '0 24px',
		color: theme.colors.n900,
		...theme.fonts.headingBold,
	},
	quickFilterItem: {
		display: 'flex',
		padding: '0 24px',
		alignItems: 'center',
		textDecoration: 'none',
	},
	formCheckWrapper: {
		'& label': {
			whiteSpace: 'pre-wrap',
		},
	},
}));

interface QuickFilterToggleProps extends PropsWithChildren {
	id: string;
	active: boolean;
	className?: string;
	onClick?(event: React.MouseEvent): void;
}

const QuickFilterToggle = React.forwardRef<HTMLButtonElement, QuickFilterToggleProps>(
	({ children, active, className, id, onClick }, ref) => {
		function handleQuickFilterToggleClick(event: React.MouseEvent) {
			event.preventDefault();

			if (onClick) {
				onClick(event);
			}
		}

		return (
			<FilterPill active={active} ref={ref} id={id} className={className} onClick={handleQuickFilterToggleClick}>
				{children}
			</FilterPill>
		);
	}
);

interface QuickFilterMenuProps extends PropsWithChildren {
	style?: any;
	className?: string;
	'aria-labelledby'?: string;
}

const QuickFilterMenu = React.forwardRef<HTMLDivElement, QuickFilterMenuProps>(
	({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
		return (
			<div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
				<ul className="m-0 list-unstyled">{children}</ul>
			</div>
		);
	}
);

interface QuickFilterItem {
	value: string | undefined;
	label: string;
	count?: number;
}

interface QuickFilterDropdownProps {
	id: string;
	active: boolean;
	value: string | undefined;
	title: string;
	items: QuickFilterItem[];
	onChange: (value: string | null) => void;
}

const QuickFilterDropdown: FC<QuickFilterDropdownProps> = ({ id, active, title, value, items, onChange }) => {
	const classes = useStyles();

	return (
		<Dropdown drop="down" onSelect={onChange}>
			<Dropdown.Toggle as={QuickFilterToggle} id={id} className={classes.quickFilterToggle} active={active}>
				{title}
			</Dropdown.Toggle>
			<Dropdown.Menu as={QuickFilterMenu} className={classes.quickFilterMenu}>
				<Dropdown.Header className={classes.quickFilterHeader}>{title}</Dropdown.Header>
				{items.map((item, index) => {
					return (
						<Dropdown.Item
							key={`${item.value}-${index}`}
							eventKey={item.value}
							className={classes.quickFilterItem}
						>
							<div
								className={`w-100 d-flex justify-content-between align-items-center ${classes.formCheckWrapper}`}
							>
								<FormCheck
									type="radio"
									label={item.label}
									checked={value === item.value}
									onChange={() => {
										// the onChange is actually handled by
										// the "onSelect" of the Dropdown.Item
										return;
									}}
									bsPrefix="cobalt-modal-form__check"
								/>
								<span className="fs-default text-muted">{item.count}</span>
							</div>
						</Dropdown.Item>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default QuickFilterDropdown;
