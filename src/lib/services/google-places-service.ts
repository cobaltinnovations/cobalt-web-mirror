import config from '@/lib/config';
import { EpicPatientData } from './account-service';

type AddressSelectCallback = (address: { formatted: string; extracted: EpicPatientData['address'] }) => void;

export const googlePlacesService = {
	autoComplete: null,
	scriptLoaded: false,
	loadScript() {
		return new Promise((resolve) => {
			if (googlePlacesService.scriptLoaded) {
				// @ts-ignore
				resolve();
				return;
			}

			const script = document.createElement('script'); // create script tag
			script.type = 'text/javascript';

			script.onload = () => {
				googlePlacesService.scriptLoaded = true;
				// @ts-ignore
				resolve();
			};

			script.src = `https://maps.googleapis.com/maps/api/js?key=${config.COBALT_WEB_GOOGLE_MAPS_API_KEY}&libraries=places`; // load by url
			document.getElementsByTagName('head')[0].appendChild(script); // append to head
		});
	},
	bindToInput(inputRef: any, onAddressSelect: AddressSelectCallback) {
		const {
			google: {
				maps: {
					places: { Autocomplete },
				},
			},
		} = window as any;

		const autoComplete = new Autocomplete(inputRef, {
			types: ['address'],
			componentRestrictions: { country: 'us' },
		});

		autoComplete.setFields(['address_components', 'formatted_address']);
		autoComplete.addListener('place_changed', () => {
			const addressObject = autoComplete.getPlace();
			const formatted = addressObject.formatted_address;
			const extracted = getAddressTokens(addressObject.address_components);
			onAddressSelect({ formatted, extracted });
		});

		googlePlacesService.autoComplete = autoComplete;
	},
};

function getAddressTokens(addressComponents: any[]): EpicPatientData['address'] {
	function findByType(type: string) {
		const result = addressComponents.find((ac) => ac.types.includes(type));

		return result ? result.long_name : '';
	}

	const streetNum = findByType('street_number');
	const route = findByType('route');

	const line1 = `${streetNum} ${route}`.trim();
	const city = findByType('locality');
	const state = findByType('administrative_area_level_1');
	const postalCode = findByType('postal_code');

	return { line1, city, state, postalCode, country: 'USA' };
}
