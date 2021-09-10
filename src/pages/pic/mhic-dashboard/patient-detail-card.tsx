import React, { FC } from 'react';
import { Container, Row, Button, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';

interface Props {
	title: string;
	buttonText: string;
	data: any[];
	isDisabled: boolean;
	type: string;
	modalClickHandler: () => void;
	dataCy? : string;
}

const useStyles = createUseStyles({
	tableCell: {
		display: "grid",
		width: "100%",
		gridTemplateColumns: "1.25fr 1.75fr",
		marginBottom: '7px',
	}
});

const PatientDetailCard: FC<Props> = (props) => {
	const { t } = useTranslation();
	const { title, modalClickHandler, buttonText, data, isDisabled, type, dataCy } = props;
	const classes = useStyles();

	return (
		<Container className={`border mb-3`}>
			<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
				<Col md={'auto'}>
					<h5 className="font-karla-bold">{title}</h5>
				</Col>
				<Col sm={'auto'}>
					<Button
						className={'mx-auto mb-1 d-flex justify-self-end border'}
						variant="light"
						size="sm"
						onClick={() => modalClickHandler()}
						disabled={isDisabled}
						data-cy={dataCy}
					>
						{buttonText}
					</Button>
				</Col>
			</Row>
			<Row>
				{
					data?.map((d, i) => {
						return (
							<div key={`${type}Label${i}`} className={classes.tableCell}>
								<div className='font-karla-regular d-flex align-items-left'>{d.label}</div>
								<div className='font-karla-regular d-flex align-items-left'>{d.data ? d.data : '-'}</div>
							</div>
						)
					})
				}
			</Row>
		</Container>
	);
};

export default PatientDetailCard;
