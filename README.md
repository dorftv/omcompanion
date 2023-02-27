# Ovenmedia Companion

This is a helper API for [Ovenmedia Engine](https://github.com/AirenSoft/OvenMediaEngine)
It uses Ovenmedia's admission webhook feature, to automatically starts the recording of a stream when stream and app name specified in a config file match.
The config files gets reloaded when it changes.

## Usage
Configure Recording in your ovenmedia engine's vhost settings.
Add the image to your docker-compose file and set the variables OM_COMPANION_API_HOSTNAME and OM_COMPANION_RESUBMIT_URL according to your environment.


## Resubmit to existing control server 
You can use environment variable OM_COMPANION_RESUBMIT_URL to post the original request to your existing server. When the variable is not set the api returns 200 OK

## Todo and Limitations
* Automatic docker builds
* Ovenmedia's Admission Webhook does not include the vhost for the stream. At the moment it defaults to default. There is [Feature Request](https://github.com/AirenSoft/OvenMediaEngine/issues/1047) at OME so that might change in the future.

