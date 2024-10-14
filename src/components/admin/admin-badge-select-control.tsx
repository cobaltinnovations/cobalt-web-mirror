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
	selections: string[];
	onChange: (value: string[]) => void;
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
				const isSelected = selections.includes(option[idKey]);

				return (
					<Button
						key={option[idKey]}
						size="sm"
						variant={isSelected ? 'primary' : 'outline-primary'}
						className="mb-2 me-2 fs-default text-nowrap"
						onClick={() => {
							onChange(
								selections.includes(option[idKey])
									? selections.filter((s) => s !== option[idKey])
									: [...selections, option[idKey]]
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
