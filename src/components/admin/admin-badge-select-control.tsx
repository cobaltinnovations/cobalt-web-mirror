import React from 'react';
import { Button } from 'react-bootstrap';
import SvgIcon from '../svg-icon';

export interface OptionModel {
	[key: string]: any;
}

export interface AdminTagGroupControlProps<T extends OptionModel> {
	idKey: keyof T;
	labelKey: keyof T;
	options: T[];
	selections: T[];
	onChange: (value: T[]) => void;
}

export function AdminBadgeSelectControl<T extends OptionModel>({
	idKey,
	labelKey,
	options,
	selections,
	onChange,
}: AdminTagGroupControlProps<T>) {
	return (
		<div className="d-flex flex-wrap">
			{options.map((option) => {
				const isSelected = !!selections.find((s) => s[idKey] === option[idKey]);

				return (
					<Button
						key={option[idKey]}
						size="sm"
						variant={isSelected ? 'primary' : 'outline-primary'}
						className="mb-2 me-2 fs-default text-nowrap"
						onClick={() => {
							onChange(
								isSelected
									? selections.filter((s) => s[idKey] !== option[idKey])
									: [...selections, option]
							);
						}}
					>
						{isSelected ? (
							<SvgIcon kit="fak" icon="check" size={16} className="me-2" />
						) : (
							<SvgIcon kit="fas" icon="plus" size={16} className="me-2" />
						)}
						{option[labelKey]}
					</Button>
				);
			})}
		</div>
	);
}
