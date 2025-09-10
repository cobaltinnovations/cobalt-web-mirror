import React from 'react';
import { Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import SvgIcon from '@/components/svg-icon';

export enum PastScheduledMessageGroupsOrOutreachType {
	SCHEDULED_MESSAGE = 'SCHEDULED_MESSAGE',
	OUTREACH = 'OUTREACH',
}

interface MhicOutreachItemProps {
	id: string;
	type: PastScheduledMessageGroupsOrOutreachType;
	name: string;
	date: string;
	onEditClick(): void;
	onDeleteClick(): void;
	icon: JSX.Element;
	title: string;
	description: string;
	disabled?: boolean;
	className?: string;
}

export const MhicOutreachItem = ({
	id,
	type,
	name,
	date,
	onEditClick,
	onDeleteClick,
	icon,
	title,
	description,
	disabled,
	className,
}: MhicOutreachItemProps) => {
	return (
		<div key={id} className={classNames('py-3 px-4', className)}>
			<div className="d-flex align-items-center justify-content-between">
				<p
					className={classNames('mb-0 text-gray', {
						'mb-2': type === PastScheduledMessageGroupsOrOutreachType.SCHEDULED_MESSAGE,
					})}
				>
					<span className="fw-semibold">{name}</span> {date}
				</p>
				{type === PastScheduledMessageGroupsOrOutreachType.OUTREACH && (
					<Dropdown>
						<Dropdown.Toggle
							as={DropdownToggle}
							id={`mhic-outreach-attempt__dropdown-menu--${id}`}
							className="p-2 border-0"
							disabled={disabled}
						>
							<SvgIcon kit="far" icon="ellipsis" size={16} className="d-flex" />
						</Dropdown.Toggle>
						<Dropdown.Menu as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
							<Dropdown.Item onClick={onEditClick}>Edit</Dropdown.Item>
							<Dropdown.Item onClick={onDeleteClick}>
								<span className="text-danger">Delete</span>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				)}
			</div>
			<div className="mb-1 d-flex align-items-center">
				{icon}
				<p className="mb-0 ms-1 fw-bold">{title}</p>
			</div>
			<div dangerouslySetInnerHTML={{ __html: description }} />
		</div>
	);
};
