import React, {FC, PropsWithChildren, useEffect} from 'react';
import {Collapse} from 'react-bootstrap';
import {createUseStyles} from 'react-jss';

import {ReactComponent as DownChevron} from '@/assets/icons/icon-chevron-down.svg';

interface AccordionStyleProps {
	open: boolean;
}

const useAccordionStyles = createUseStyles({
	accordionToggle: {
		display: 'flex',
		paddingTop: 20,
		paddingBottom: 20,
		cursor: 'pointer',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	chevronIcon: ({ open }: AccordionStyleProps) => ({
		width: 12,
		height: 12,
		opacity: 0.48,
		transition: '0.2s transform',
		transform: open ? '' : 'rotate(90deg)',
	}),
});

interface AccordionProps extends PropsWithChildren {
	title: string;
	open: boolean;

	onToggle(): void;

	onDidOpen?(): void;

	onDidClose?(): void;

	toggleClass?: string,
	titleClass?: string,
}

const Accordion: FC<AccordionProps> = ({title, open, onToggle, onDidOpen, onDidClose, titleClass, toggleClass, children}) => {
	const classes = useAccordionStyles({
		open,
	});

	useEffect(() => {
		if (open) {
			if (onDidOpen) onDidOpen();
		} else {
			if (onDidClose) onDidClose();
		}
	}, [onDidClose, onDidOpen, open]);

	return (
		<>
			<div className={`${classes.accordionToggle} ${toggleClass}`} onClick={onToggle}>
				<span className={`d-block font-weight-bold ${titleClass}`}>{title}</span>
				<DownChevron className={classes.chevronIcon}/>
			</div>
			<Collapse in={open}>
				<div className="overflow-hidden">{children}</div>
			</Collapse>
		</>
	);
};

export default Accordion;
