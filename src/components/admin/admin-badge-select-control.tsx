import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import React from 'react';
import { Button } from 'react-bootstrap';

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
							<CheckIcon width={20} height={20} className="me-2" />
						) : (
							<PlusIcon width={20} height={20} className="me-2" />
						)}
						{option[labelKey]}
					</Button>
				);
			})}
		</div>
	);
}
