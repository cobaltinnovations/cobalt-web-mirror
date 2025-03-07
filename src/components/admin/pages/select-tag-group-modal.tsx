import React, { useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelper from '@/components/input-helper';
import { tagService } from '@/lib/services';
import { TagGroup } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
const useStyles = createUseThemedStyles(() => ({
	modal: {
		maxWidth: 480,
	},
}));

interface SelectTagGroupModalProps extends ModalProps {
	tagGroupId: '';
	onAdd(tagGroupId: string): void;
}

export const SelectTagGroupModal = ({ tagGroupId, onAdd, ...props }: SelectTagGroupModalProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const tagSelect = useRef<HTMLSelectElement>(null);
	const [tagGroupOptions, setTagGroupOptions] = useState<TagGroup[]>([]);
	const [formValues, setFormValues] = useState({ tagGroupId: '' });

	const fetchData = async () => {
		setTagGroupOptions([]);

		try {
			const { tagGroups } = await tagService.getTagGroups().fetch();
			setTagGroupOptions(tagGroups);
		} catch (error) {
			handleError(error);
		}
	};

	const handleOnEnter = () => {
		setFormValues({ tagGroupId: '' });
		fetchData();
	};

	const handleOnEntered = () => {
		tagSelect.current?.focus();
	};

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onAdd(formValues.tagGroupId);
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Select tag</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						as="select"
						label="Tag"
						value={formValues.tagGroupId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								tagGroupId: currentTarget.value,
							}));
						}}
						required
					>
						<option value="" disabled>
							Select tag...
						</option>
						{tagGroupOptions.map((tg) => (
							<option key={tg.tagGroupId} value={tg.tagGroupId}>
								{tg.name}
							</option>
						))}
					</InputHelper>
				</Modal.Body>
				<Modal.Footer>
					<div className="text-right">
						<Button type="button" variant="outline-primary" onClick={props.onHide}>
							Cancel
						</Button>
						<Button type="submit" className="ms-2" variant="primary">
							Add Tag
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
