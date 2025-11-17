# Activesense Portal

Activesense is a small Node.js/Express application that secures a collection of
wellness-oriented landing pages behind Google OAuth.  It also ships with a
front-end dashboard that visualizes telemetry from an IoT water-monitoring
prototype.  This README walks through the project structure, the moving parts,
and the steps required to run it locally or adapt it to your own deployment.

## Project overview

| Layer | What lives here |
| --- | --- |
| **login.js** | Express server, session management, Passport configuration, and routing for every static page under `pages/`. |
| **pages/** | HTML/CSS/JS assets for the welcome page, login prompt, protected dashboards, meal plans, yoga tips, water analytics, and supporting images/text files. |
| **pages/app.js** | Browser-side JavaScript that calls an IoT API (`Sensor_URL`) and renders charts/tables on the water analytics screen. |

### Core features

- **Google OAuth sign-in** – `/auth/google` and `/google/callback` are wired up
  with `passport-google-oauth20` to authenticate visitors with a Google account
  before they can reach the protected routes.
- **Session-based access control** – `express-session` and Passport manage user
  sessions and gate endpoints such as `/protected`, `/protected/Diet`, and
  `/protected/Water` via the `isLoggedIn` middleware.
- **Static wellness content** – The HTML pages under `pages/` cover diet plans,
  yoga routines, hydration tips, and watch dashboards that are displayed once a
  user signs in.  Assets are delivered with expressive typography and CSS
  animations to give the portal a polished landing-page feel.
- **IoT hydration dashboard** – `pages/water.html` + `pages/app.js` fetch sensor
  readings (TDS, water level, timestamps) from a REST endpoint and plot them
  using Highcharts, while also computing “last consumed” and water-quality
  feedback strings.
- **Remote sensor redirect** – `/water` can forward users to an external
  `sensordata1.onrender.com` deployment when you want to expose the telemetry
  service separately from the protected pages.

## Prerequisites

- Node.js 18.x (or any LTS build compatible with Express 4 and Passport 0.6)
- npm 9+
- A Google Cloud project with OAuth 2.0 Web credentials
- (Optional) An IoT data service that exposes the `Sensor_URL` REST API consumed
  by `pages/app.js`

## Installation

```bash
npm install
```

`package.json` exposes a single script:

```bash
npm start
```

The script launches the Express server with `nodemon login.js`.  You can also
run `node login.js` directly in production.

## Configuring Google OAuth

1. Create OAuth credentials in Google Cloud Console with the following
   authorized redirect URI (or your deployed URL):
   `http://localhost:5000/google/callback`.
2. Capture the **Client ID** and **Client secret** values.
3. Set the configuration before starting the server.  The current code uses
   literal strings inside `login.js`; swap them out for environment variables so
   secrets never land in source control:

   ```js
   const googleConfig = {
     clientID: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/google/callback'
   };
   ```

4. Define the corresponding environment variables and a session secret in your
   shell (or `.env` file if you add `dotenv`).

```bash
export GOOGLE_CLIENT_ID="xxx"
export GOOGLE_CLIENT_SECRET="xxx"
export GOOGLE_CALLBACK_URL="http://localhost:5000/google/callback"
export SESSION_SECRET="choose-a-long-random-string"
```

## Running the application locally

```bash
npm start
```

- Navigate to `http://localhost:5000/` to see the welcome screen.
- Click **Get Started** to reach `/login` and initiate the Google sign-in flow.
- Upon success you land on `/protected`, where the navigation tiles link out to
  Diet, Water, Yoga, Meal Plan, and Watch views.
- Direct access to `/protected/...` routes redirects to `/auth/google` until the
  session is authenticated.

## Routes

| Route | Description |
| --- | --- |
| `/` | Public welcome page (`pages/welcome.html`). |
| `/login` | Login landing page (`pages/second.html`). |
| `/auth/google` | Initiates Google OAuth with `profile` + `email` scopes. |
| `/google/callback` | OAuth callback. Successful logins redirect to `/protected`. |
| `/protected` | Feature hub with hero tiles (`pages/third.html`). |
| `/protected/Diet` | Diet planner landing page (`pages/fourth.html`). |
| `/protected/Meal_Plan` + children | Breakfast/Lunch/Snacks/Dinner detail pages. |
| `/protected/Yoga` | Yoga routines (`pages/yoga.html`). |
| `/protected/Water` | Water insights dashboard (`pages/water.html`). |
| `/protected/Watch` | Smart-watch dashboard (`pages/main.html`). |
| `/water` | Redirect to the hosted IoT dashboard (`sensordata1.onrender.com`). |
| `/result` | Serves `pages/result.txt` (example static asset). |
| `/logout` | Calls `req.logout()` and sends users back to `/`. |
| `/auth/failure` | Displays a simple error string.

Every other HTML file under `pages/` is reachable through the protected portal’s
navigation links.

## IoT dashboard integration

`pages/app.js` drives the hydration dashboard and expects a sensor gateway that
exposes two endpoints under `Sensor_URL` (default: `http://localhost:5003/send-data`):

- `GET /sensor-data` → returns an array of `{ data, loadcelldata, date }`
  records.  The script computes recent values, qualitative water-quality text,
  and renders Highcharts line graphs plus a bootstrap table.
- `POST /sensor-data` → accepts `{ username, password }` (currently wired to a
  click handler tied to `#loginbutton`).

If your telemetry API lives elsewhere, update the `Sensor_URL` constant or make
it configurable via query params/local storage.

The dashboard pulls fonts from Google Fonts and charts from CDN-hosted
Highcharts, so ensure clients have internet access or host these dependencies
locally if your deployment must run offline.

## Static assets

- `pages/style.css` contains shared styles used across multiple pages.
- `pages/images/` holds hero imagery for diet, water, yoga, and smart-watch
  tiles.
- Plain-text helpers such as `calorie.txt`, `steps.txt`, and `result.txt` back
  some of the call-to-action copy on the HTML pages.

Feel free to edit the HTML/CSS files directly or integrate a template engine if
you prefer dynamic rendering.

## Deployment notes

- Serve the app behind HTTPS—Google OAuth requires secure origins in production.
- Store secrets in environment variables or a secrets manager; never check them
  into Git.
- Consider enabling a production-ready session store (Redis, Memcached, etc.) if
  you expect multiple server instances.  The default in-memory store is not
  suitable for real-world traffic.
- Tighten the `/water` redirect or proxy to limit exposure if it hosts sensitive
  telemetry.

## Next steps

Potential enhancements include:

- Moving credential strings and other configuration knobs to environment
  variables or a `.env` file.
- Converting the HTML pages into reusable components via a template engine or a
  front-end framework.
- Replacing the `Sensor_URL` constants with WebSocket streams for near real-time
  telemetry.
- Adding API routes to persist user-specific data (diet preferences, hydration
  goals, etc.).

Happy hacking!
