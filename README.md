# PlexOpener [![Docker Pulls](https://img.shields.io/docker/pulls/dodoooh/plexopener)](https://hub.docker.com/r/dodoooh/plexopener)

PlexOpener is a small web application that securely forwards the public IP address using PlexAuth to a webhook. This can be useful in dynamically setting up port forwarding rules on a firewall, providing an additional layer of security.

## Installation

PlexOpener is available as a Docker image, making it easy to deploy and run. To install it, simply set the `FORWARD_URL` and `WEBHOOK_URL` environment variables in your Docker container, and you're ready to go!

```yml
docker run -e FORWARD_URL=<forward_url> -e WEBHOOK_URL=<webhook_url> -p 3000:3000 dodoooh/plexopener:latest
```

```yml
version: '3'
services:
  plexopener:
    image: dodoooh/plexopener
    container_name: plexopener
    environment:
      FORWARD_URL: <forward_url>
      WEBHOOK_URL: <webhook_url>
    ports:
      - "8080:8080"
```


## Usage

Once you have PlexOpener installed, you can access it by navigating to http://localhost:3000 (or the URL of your server). From there, you'll be prompted to authenticate with Plex using PlexAuth.

Once authenticated, PlexOpener will securely forward your public IP address to the specified webhook, allowing you to dynamically set up port forwarding rules on your firewall as needed.


## Contributing

If you'd like to contribute to PlexOpener, feel free to fork the repository and submit a pull request. 

## License

PlexOpener is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0). To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/.