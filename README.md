# Pokémon Battle Game

Welcome to the Pokémon Battle Game! This project allows you to select your favorite Pokémon (or a team of them) and simulate battles against computer-controlled opponents.

## Getting Started (Development)

This is a Next.js project bootstrapped with create-next-app.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses `next/font` to automatically optimize and load Geist, a new font family for Vercel.

## Getting Started (With Docker Compose)

This project can also be run using Docker Compose, which provides a consistent and isolated environment.

### Prerequisites

- Docker Desktop: Download Docker Desktop (includes Docker Engine and Docker Compose)

### Running the Application with Docker Compose

Follow these simple steps to get the game up and running using Docker:

#### Clone the Repository:

If you haven't already, clone this GitHub repository to your local machine:
```bash
git clone https://github.com/AtQ0/pokemon-game.git
cd pokemon-game
```

## Build and Run with Docker Compose

Once you are in the project's root directory (where the `docker-compose.yml` and `Dockerfile` are located), execute the following command:

```bash
docker-compose up --build

```

`docker-compose up`: Starts the services defined in `docker-compose.yml`.

- `--build`: This flag tells Docker Compose to build the images from scratch using the Dockerfile before starting the containers. This ensures all necessary Node.js dependencies are installed inside the Docker image during the build process, so you do not need to run `npm install` separately on your host machine.

This process might take a few minutes the first time as Docker builds the image and downloads all the required Node.js packages.

## Access the Game

Once Docker Compose has finished starting the services (you should see output indicating the Next.js server is running, typically on port 3000), open your web browser and navigate to
[http://localhost:3000](http://localhost:3000)

You should now see the Pokémon Battle Game!

## Stopping the Application (Docker Compose)

To stop the running Docker containers and free up resources, press `Ctrl+C` in your terminal where `docker-compose up` is running.

To stop and remove the containers, networks, and volumes created by `up`, run:

```bash
docker-compose down
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
