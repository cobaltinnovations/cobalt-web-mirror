import React, { FC, useEffect, useState } from 'react';
import moment from 'moment';
import { Container, Row, Button, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PinOn } from '@/assets/pic/icon_pin_on.svg';
import { ReactComponent as PinOff } from '@/assets/pic/icon_pin_off.svg';
import { FormattedDisposition } from '@/pages/pic/utils';
import { useUpdateTriageReview } from '@/hooks/pic-hooks';
interface Props {
	disposition: FormattedDisposition;
	modalClickHandler: () => void;
}

const TriageCard: FC<Props> = (props) => {
	const { t } = useTranslation();
	const { disposition, modalClickHandler } = props;

	const { needsFocusedReview, psychiatristReviewedDt, bhpReviewedDt, comment } = disposition.triageReview;
	const commentString = comment || '';
	const [triageComment, setTriageComment] = useState(commentString);
	const commentDirty = triageComment !== commentString;

	useEffect(() => {
		if (comment) {
			setTriageComment(comment);
		}
	}, [comment]);

	const { mutate } = useUpdateTriageReview();

	const inputHandler = (value: string) => {
		setTriageComment(value);
	};

	const handleFocusedReview = () => {
		const body = {
			bhpReviewedDt,
			psychiatristReviewedDt: psychiatristReviewedDt,
			comment,
			needsFocusedReview: !needsFocusedReview,
		};
		mutate({ dispositionId: disposition.id, body });
	};

	const handleBhpReview = () => {
		const body = {
			bhpReviewedDt: bhpReviewedDt ? '' : moment().format(),
			psychiatristReviewedDt: psychiatristReviewedDt,
			comment,
			needsFocusedReview,
		};
		mutate({ dispositionId: disposition.id, body });
	};

	const handlePshReview = () => {
		const body = {
			bhpReviewedDt,
			psychiatristReviewedDt: psychiatristReviewedDt ? '' : moment().format(),
			comment,
			needsFocusedReview,
		};
		mutate({ dispositionId: disposition.id, body });
	};

	const handleComment = () => {
		const body = {
			bhpReviewedDt,
			psychiatristReviewedDt,
			comment: triageComment,
			needsFocusedReview,
		};
		mutate({ dispositionId: disposition.id, body });
	};

	return (
		<Container className={'border mb-3 min-h-50'}>
			<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
				<Col md={'auto'}>
					<h5 className="font-karla-bold">{t('mhic.patientDetailModal.triageTab.triageTile.title')}</h5>
				</Col>
				<Col sm={'auto'}>
					<Button
						className={'mx-auto mb-1 d-flex justify-self-end border'}
						variant="light"
						// @ts-ignore
						size="xsm"
						onClick={modalClickHandler}
						data-cy="change-triage-button"
					>
						{t('mhic.patientDetailModal.triageTab.triageTile.modalButton')}
					</Button>
				</Col>
			</Row>
			<Row>
				<Container>
					<Row>
						<Col sm={'auto'} className="m-1 mb-2 p-1" onClick={() => handleFocusedReview()}>
							{needsFocusedReview ? <PinOn /> : <PinOff />}
						</Col>
						<Col className=" m-1 mb-2 p-1 d-block w-100">{t('mhic.patientDetailModal.triageTab.triageTile.focusedReview')}</Col>
					</Row>
					<Row className="align-items-center">
						<Col sm={'auto'} className="m-1 mb-2 p-1">
							<input type="checkbox" name="bhpReview" onChange={() => handleBhpReview()} checked={!!bhpReviewedDt} />
						</Col>
						<Col className=" m-1 mb-2 p-1 d-block w-100">{t('mhic.patientDetailModal.triageTab.triageTile.bhp')}: Lisa Vallee</Col>
						<Col>
							{bhpReviewedDt ? (
								<p>
									{t('mhic.patientDetailModal.triageTab.triageTile.reviewed')} {moment(bhpReviewedDt).format('MM/DD/YYYY')}
								</p>
							) : (
								<p>{t('mhic.patientDetailModal.triageTab.triageTile.notReviewed')}</p>
							)}
						</Col>
					</Row>
					<Row className="align-items-center">
						<Col sm={'auto'} className="m-1 mb-2 p-1">
							<input type="checkbox" name="psyReview" onChange={() => handlePshReview()} checked={!!psychiatristReviewedDt} />
						</Col>
						<Col className=" m-1 mb-2 p-1 d-block w-100">{t('mhic.patientDetailModal.triageTab.triageTile.psychiatrist')}: Erin Torday</Col>
						<Col>
							{psychiatristReviewedDt ? (
								<p>
									{t('mhic.patientDetailModal.triageTab.triageTile.reviewed')} {moment(psychiatristReviewedDt).format('MM/DD/YYYY')}
								</p>
							) : (
								<p>{t('mhic.patientDetailModal.triageTab.triageTile.notReviewed')}</p>
							)}
						</Col>
					</Row>
					<Form>
						<Form.Group>
							<Form.Control
								as="textarea"
								rows={3}
								value={triageComment}
								className={'text-dark h-100'}
								onChange={(e) => inputHandler(e.target.value)}
								placeholder={t('mhic.patientDetailModal.triageTab.triageTile.commentPlaceholder')}
							/>
						</Form.Group>
						<Form.Group as={Row}>
							<Col sm={{ span: 2, offset: 10 }}>
								<Button
									className={'mx-auto d-flex border'}
									type="submit"
									// @ts-ignore
									size="xsm"
									onClick={handleComment}
									data-cy="save-comment-button"
									disabled={!commentDirty}
								>
									{t('mhic.patientDetailModal.triageTab.triageTile.submitComment')}
								</Button>
							</Col>
						</Form.Group>
					</Form>
				</Container>
			</Row>
		</Container>
	);
};

export default TriageCard;
