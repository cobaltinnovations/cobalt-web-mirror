import React from 'react';
import ConnectWithSupportItem from '@/components/connect-with-support-item';

const MedicationPresriber = () => {
	return (
		<ConnectWithSupportItem
			providerId="MEDICATION_PRESCRIBER"
			imageUrl="/#"
			title="Cobalt Clinic"
			descriptionHtml="
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget nibh vitae sapien lacinia dignissim dignissim et nunc. Curabitur volutpat sapien a ex cursus maximus. Duis porttitor tincidunt dui, a eleifend mi. Donec ac pellentesque nisi. Morbi eleifend condimentum mi, at dignissim ex mollis sit amet. Cras auctor mauris eget lobortis feugiat. Nunc aliquam lacinia nibh eu venenatis.
                </p>
                <p>
                    Morbi vestibulum dictum leo, at iaculis tellus. Pellentesque pellentesque malesuada gravida. Phasellus et iaculis libero, a vehicula magna. Suspendisse dignissim, tortor eget molestie accumsan, nunc nisl interdum ligula, et bibendum tellus sem et magna. Donec hendrerit ornare erat, vitae rutrum lacus fringilla venenatis. Donec ut orci at dui posuere tempus. Nulla imperdiet est arcu, ac volutpat felis tempor vel.
                </p>
                <p>Currently Cobalt Clinic works with the following insurers:</p>
                <ul>
                    <li>Lorem ipsum dolor sit amet</li>
                    <li>consectetur adipiscing elit</li>
                    <li>Quisque ut felis at nisi semper feugiat</li>
                    <li>Duis tempus sem non rutrum</li>
                    <li>Nulla fermentum nibh quis mauris feugiat</li>
                </ul>
                <p><strong>Available Mon-Fri, 9:00AM-12:00PM & 1:00PM-5:00PM<br/>Call to Schedule an Appointment</strong></p>
            "
			buttons={[
				{
					as: 'a',
					className: 'text-decoration-none',
					href: `tel:+12155559999`,
					title: 'Call (215) 555-9999',
				},
			]}
			showViewButton={false}
			onModalTimeButtonClick={() => {
				return;
			}}
		/>
	);
};

export default MedicationPresriber;
