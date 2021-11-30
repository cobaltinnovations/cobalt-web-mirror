import React, { FC } from 'react';
import { Button, Col, Container } from 'react-bootstrap';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as TextIcon } from '@/assets/pic/icon_mobile_phone_dark.svg';
import { useTranslation } from 'react-i18next';

interface Props {
	hideHeader?: boolean;
	inCrisis?: boolean;
}

const ContactLCSW: FC<Props> = ({ hideHeader, inCrisis }) => {
	const { t } = useTranslation();
	const contactButtons = [
		{
			key: 'suicidePreventionLine',
			number: '800-273-8255',
			type: 'call',
		},
		{
			key: 'crisisTextLine',
			number: '741 741',
			type: 'text',
		},
		{
			key: 'picCrisis',
			number: '215-555-1212',
			type: 'call',
		},
		{
			key: 'emergency',
			number: '911',
			type: 'call',
		},
	];

	return (
		<Container style={{ maxWidth: '600px' }}>
			<Col className={'col-auto mt-3'}>
				{hideHeader !== true && <h5>{t('contactLcsw.header')}</h5>}
				{contactButtons.map((button) => (
					<Button
						variant="grey"
						className={'my-2 d-flex align-items-center'}
						href={`tel:${button.number}`}
						key={button.key}
					>
						{button.type === 'call' ? <PhoneIcon className={'mr-2'} /> : <TextIcon className={'mr-2'} />}
						<div className={'d-flex flex-column font-size-s'}>
							<span className={'text-primary mb-2'}>
								{t(`${button.type === 'call' ? 'contactLcsw.call' : 'contactLcsw.text'}`)}{' '}
								{button.number}
							</span>
							<span className={'font-weight-regular'}>{t(`contactLcsw.${button.key}`)}</span>
						</div>
					</Button>
				))}
				{inCrisis === true && (
					<>
						<p>{t('contactLcsw.inCrisisAlert')}</p>
						<p>{t('contactLcsw.inCrisisResources')}</p>
					</>
				)}
			</Col>
		</Container>
	);
};

export default ContactLCSW;
