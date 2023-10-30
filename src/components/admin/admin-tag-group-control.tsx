import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { Tag, TagGroup } from '@/lib/models';
import React from 'react';
import { Button } from 'react-bootstrap';

export interface AdminTagGroupControlProps {
	tagGroup: TagGroup;
	selectedTagIds: string[];
	onTagClick: (tag: Tag) => void;
}

export const AdminTagGroupControl = ({ tagGroup, selectedTagIds, onTagClick }: AdminTagGroupControlProps) => {
	return (
		<div className="mb-4">
			<h5 className="mb-2">{tagGroup.name}</h5>

			<div className="d-flex flex-wrap">
				{(tagGroup.tags ?? []).map((tag) => {
					const isSelected = selectedTagIds.includes(tag.tagId);

					return (
						<Button
							key={tag.tagId}
							size="sm"
							variant={isSelected ? 'primary' : 'outline-primary'}
							className="mb-2 me-2 fs-default text-nowrap"
							onClick={() => {
								onTagClick(tag);
							}}
						>
							{isSelected ? <CheckIcon className="me-2" /> : <PlusIcon className="me-2" />}
							{tag.name}
						</Button>
					);
				})}
			</div>
		</div>
	);
};
