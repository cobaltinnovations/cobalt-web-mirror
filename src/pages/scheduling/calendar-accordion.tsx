import Accordion from '@/components/accordion';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

export const CalendarAccordion = () => {
	const [accordionExpanded, setAccordionExpanded] = useState(false);

	return (
		<Accordion
			open={accordionExpanded}
			onToggle={() => {
				setAccordionExpanded(!accordionExpanded);
			}}
			title="My Calendar"
		>
			<div className="mb-4">
				<Form.Check
					type="radio"
					bsPrefix="cobalt-modal-form__check"
					id="cal1"
					label="Owner"
					checked={true}
					onChange={() => {
						//
					}}
				/>

				<Form.Check
					type="radio"
					bsPrefix="cobalt-modal-form__check"
					id="cal2"
					label="Editor"
					checked={false}
					onChange={() => {
						//
					}}
				/>

				<Form.Check
					type="radio"
					bsPrefix="cobalt-modal-form__check"
					id="cal3"
					label="Viewer"
					checked={false}
					onChange={() => {
						//
					}}
				/>
			</div>
		</Accordion>
	);
};
