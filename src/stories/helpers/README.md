## Storybook Notes

#### Configuration

Storybook setup and configuration lives in `.storybook/` folder:

-   `main.ts` Configures Storybook with addons/plugins and its webpack
-   `manager.ts` Customizes the look & feel of the tool
-   `preview.ts` Global/standard configuration applied to all stories
    -   Enables Router addon
    -   Wraps Stories in global app providers
    -   Initializes `msw`
-   `sentry-mock.js` Used in `main.ts`` to replace all imports to Sentry during storybook imports
-   `storybook-theme.ts` Mapping of cobalt colors to storybook theme config.

#### Notable addons:

-   `storybook-addon-react-router-v6`
    When working on a story that depends on some loader data from a route, we can configure router state using the `parameters` in story config and setting `reactRouter`:

        ```javascript
        reactRouter: reactRouterParameters({
        	routing: [
        		{
        			id: 'root',
        			loader: () => ({
        				accountResponse: {
        					account: accountJSON,
        				},
        				institutionResponse: {
        					institution: {
        						featuresEnabled: true,
        						features: featuresJSON,
        					},
        				},
        			}),
        		},
        	],
        }),
        ```

    Another example is the params passed in the [icMhicRouterParams](ic-router-params.tsx) used in all mhic component stories.

-   `msw` (Mock Service Worker) & `msw-storybook-addon`
    Used to run a service worker when serving storybook that has the ability to intercept http calls made by stories and mock out their responses (or errors). Configure mock handlers using the `parameters` in story config and setting a list of `msw.handlers`:

        ```
        msw: {
        	handlers: [
        		rest.get('/patient-order-closure-reasons', (req, res, ctx) => {
        			return res(
        				ctx.json({
        					patientOrderClosureReasons: [
        						{
        							patientOrderClosureReasonId: 'reason-id-1',
        							description: 'Reason 1',
        						},
        						{
        							patientOrderClosureReasonId: 'reason-id-2',
        							description: 'Reason 2',
        						},
        					],
        				})
        			);
        		}),
        	],
        },
        ```

#### Helpers

-   [IC Router Params](./ic-router-params.tsx)
    Helper objects/config for setting `/ic` router state.
-   [`ModalWrapper`](./modal-wrapper.tsx)
    Reusable piece to control/toggle visiblity state of a modal, since there's plenty of those in the UI/stories :D
-   [`PlaceholderImageRenderer`](./placeholder-image-renderer.tsx)
    Reusable piece wrapping `useRandomPlaceholderImage` to get a random img src as needed for stories.
