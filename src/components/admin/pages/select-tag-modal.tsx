import React, { useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { TagGroup } from '@/lib/models';
import { tagService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles(() => ({
	modal: {
		maxWidth: 480,
	},
}));

interface SelectTagModalProps extends ModalProps {
	onAdd(tagId: string): void;
}

export const SelectTagModal = ({ onAdd, ...props }: SelectTagModalProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const tagSelect = useRef<HTMLSelectElement>(null);
	const [tagGroupOptions, setTagGroupOptions] = useState<TagGroup[]>([]);
	const [formValues, setFormValues] = useState({ tagId: '' });

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
		setFormValues({ tagId: '' });
		fetchData();
	};

	const handleOnEntered = () => {
		tagSelect.current?.focus();
	};

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onAdd(formValues.tagId);
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
						value={formValues.tagId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								tagId: currentTarget.value,
							}));
						}}
						required
					>
						<option value="" disabled>
							Select tag...
						</option>
						{tagGroupOptions.map((tg) => (
							<optgroup key={tg.tagGroupId} label={tg.name}>
								{(tg.tags ?? []).map((t) => (
									<option key={t.tagId} value={t.tagId}>
										{t.name}
									</option>
								))}
							</optgroup>
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
