import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { Button, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FormattedDisposition, FormattedPatientObject } from '../utils';
import { ReactComponent as XCircleIcon } from '@/assets/icons/icon-x-circle.svg';
import { useDeleteMhicDispositionNote, usePostMhicDispositionNote } from '@/hooks/pic-hooks';
import useHandleError from '@/hooks/use-handle-error';

interface Props {
	disposition: FormattedDisposition;
	patient: FormattedPatientObject;
}

const Notes: FC<Props> = ({ disposition }) => {
	const handleError = useHandleError();
	const { t } = useTranslation();
	const [mhicNoteContent, setMhicNoteContent] = useState('');

	const { mutateAsync: postNote } = usePostMhicDispositionNote();
	const { mutateAsync: deleteNote } = useDeleteMhicDispositionNote();

	return (
		<Row className="p-2 m-2 d-flex justify-content-between" data-cy="notes-tab-content">
			<Col className="m-3 py-3 border">
				<h5 className="font-karla-bold">{t('mhic.patientDetailModal.notesTab.enterUpdateTile.title')}</h5>

				<div className="mx-auto mt-2 p-2 w-100 border font-karla-bold bg-light text-gray">
					<textarea
						name="notes-comments"
						value={mhicNoteContent}
						className="w-100 p-1 no-border text-dark h-100"
						onChange={(e) => setMhicNoteContent(e.target.value)}
						style={{ minHeight: 200 }}
						placeholder={t('mhic.patientDetailModal.notesTab.enterUpdateTile.textboxPlaceholder')}
					/>
				</div>

				<div className="mt-2 p-2 w-100 mx-auto justify-content-end d-flex">
					<Button
						className="mb-1 d-flex justify-self-end"
						variant="primary"
						//@ts-expect-error custom size
						size="xsm"
						onClick={() => {
							postNote({
								dispositionId: disposition.id,
								note: mhicNoteContent,
							})
								.then(() => {
									setMhicNoteContent('');
								})
								.catch(handleError);
						}}
						data-cy="submit-note-button"
					>
						{t('mhic.patientDetailModal.notesTab.enterUpdateTile.submitButton')}
					</Button>
				</div>
			</Col>

			<Col className="m-3 py-3 border d-flex flex-column">
				<h5 className="font-karla-bold mb-2">{t('mhic.patientDetailModal.notesTab.updateHistoryTile.title')}</h5>

				<div
					className="border px-3"
					style={{
						maxHeight: 400,
						overflowY: 'scroll',
					}}
					data-cy="note-history-log"
				>
					{disposition?.notes?.map((dispositionNote, index) => {
						const isOdd = index % 2 !== 0;

						return (
							<Row
								key={dispositionNote.dispositionNoteId}
								className={classnames('d-flex flex-column px-2 py-1 font-size-xxs', {
									'bg-light-gray': isOdd,
								})}
							>
								<div className="d-flex justify-content-between align-items-center w-100">
									<div className="d-flex align-items-center">
										<Button
											className="mr-2 text-secondary"
											variant="icon"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												if (!window.confirm(`Are you sure you want to delete this note?`)) {
													return;
												}

												deleteNote(dispositionNote.dispositionNoteId)
													.then(() => {
														//
													})
													.catch(handleError);
											}}
										>
											<XCircleIcon height={16} width={16} />
										</Button>

										<div className="font-weight-bold font-size-s">{dispositionNote.createdDtDescription}</div>
									</div>

									<div>{dispositionNote.authorDescription}</div>
								</div>

								<div data-cy="note-content">
									<p
										style={{
											whiteSpace: 'break-spaces',
										}}
									>
										{dispositionNote.note}
									</p>
								</div>
							</Row>
						);
					})}
				</div>
			</Col>
		</Row>
	);
};

export default Notes;
