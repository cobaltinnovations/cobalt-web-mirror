import React from 'react';
import classNames from 'classnames';

import SvgIcon from './svg-icon';
import { Clinic, Provider } from '@/lib/models';

interface ProviderInfoDetailContactProps {
	provider?: Provider;
	clinic?: Clinic;
}

interface ProviderInfoDetailContactSource {
	phoneNumber?: string | null;
	phoneNumberDescription?: string | null;
	formattedPhoneNumber?: string | null;
	bioUrl?: string | null;
	websiteUrl?: string | null;
	address?: ProviderInfoDetailAddress | null;
}

interface ProviderInfoDetailAddress {
	formattedAddress?: string | null;
	streetAddress1?: string | null;
	streetAddress2?: string | null;
	locality?: string | null;
	city?: string | null;
	region?: string | null;
	state?: string | null;
	postalCode?: string | null;
}

type ProviderInfoDetailContactIcon = React.ComponentProps<typeof SvgIcon>['icon'];

interface ProviderInfoDetailContactRow {
	icon: ProviderInfoDetailContactIcon;
	content: JSX.Element;
}

const ProviderInfoDetailContact = ({ provider, clinic }: ProviderInfoDetailContactProps) => {
	const contactRows = getProviderInfoDetailContactRows(provider ?? clinic);

	if (contactRows.length === 0) {
		return null;
	}

	return (
		<div className="mt-6 bg-white border rounded-4 shadow-lg py-8 px-6">
			<h5 className="mb-0">Contact</h5>
			{contactRows.map((contactRow, contactRowIndex) => (
				<div
					key={contactRowIndex}
					className={classNames('py-6 d-flex align-items-center', {
						'border-bottom': contactRowIndex < contactRows.length - 1,
					})}
				>
					<div className="me-4 p-3 bg-p50 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
						<SvgIcon kit="far" icon={contactRow.icon} size={16} className="text-primary" />
					</div>
					{contactRow.content}
				</div>
			))}
		</div>
	);
};

const getProviderInfoDetailContactRows = (source?: ProviderInfoDetailContactSource): ProviderInfoDetailContactRow[] => {
	if (!source) {
		return [];
	}

	const phoneNumber = trimToUndefined(source.phoneNumber);
	const phoneNumberDescription =
		trimToUndefined(source.formattedPhoneNumber) ?? trimToUndefined(source.phoneNumberDescription) ?? phoneNumber;
	const address = formatProviderInfoDetailAddress(source.address);
	const websiteUrl = trimToUndefined(source.websiteUrl) ?? trimToUndefined(source.bioUrl);
	const rows: ProviderInfoDetailContactRow[] = [];

	if (phoneNumber && phoneNumberDescription) {
		rows.push({
			icon: 'phone',
			content: (
				<div>
					<a className="d-block mb-0 fw-bold text-dark text-decoration-none" href={`tel:${phoneNumber}`}>
						{phoneNumberDescription}
					</a>
				</div>
			),
		});
	}

	if (address) {
		rows.push({
			icon: 'location-dot',
			content: (
				<div>
					<p className="mb-1 fw-bold">{address.title}</p>
					{address.description && <p className="mb-0 text-muted">{address.description}</p>}
				</div>
			),
		});
	}

	if (websiteUrl) {
		rows.push({
			icon: 'globe',
			content: (
				<div>
					<a
						className="d-block mb-0 fw-bold text-primary text-decoration-none"
						href={websiteUrl}
						target="_blank"
						rel="noreferrer"
					>
						{websiteUrl}
					</a>
				</div>
			),
		});
	}

	return rows;
};

const trimToUndefined = (value?: string | null) => {
	const trimmedValue = value?.trim();

	return trimmedValue ? trimmedValue : undefined;
};

const formatProviderInfoDetailAddress = (address?: ProviderInfoDetailAddress | null) => {
	if (!address) {
		return;
	}

	const formattedAddress = trimToUndefined(address.formattedAddress);

	if (formattedAddress) {
		return {
			title: formattedAddress,
		};
	}

	const title = trimToUndefined(address.streetAddress1);
	const streetAddress2 = trimToUndefined(address.streetAddress2);
	const locality = trimToUndefined(address.locality) ?? trimToUndefined(address.city);
	const region = trimToUndefined(address.region) ?? trimToUndefined(address.state);
	const postalCode = trimToUndefined(address.postalCode);
	const regionLine = [region, postalCode].filter(Boolean).join(' ');
	const localityLine = [locality, regionLine].filter(Boolean).join(', ');
	const description = [streetAddress2, localityLine].filter(Boolean).join(', ');

	if (!title) {
		return;
	}

	return {
		title,
		description: description || undefined,
	};
};

export default ProviderInfoDetailContact;
