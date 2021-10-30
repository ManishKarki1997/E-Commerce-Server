# Varya Commerce Application

Varya Commerce is a simple ecommerce application that you can check it out [here](https://ssr-ecommerce-app.vercel.app/)

URL -> https://ssr-ecommerce-app.vercel.app/

Frontend repo for this project [here](https://github.com/ManishKarki1997/SSR-Ecommerce-App)

#### Tech Stack Used

- Nuxt as the frontend
- Node JS as the backend
- Postgres Database (using Prisma as the ORM)
- Stripe Payment System
- Typescript (minimal, still learning myself)
- Cloudinary as the image hosting service
- Deployed to Vercel

## Installation

##### 1. Make sure to run the frontend from [here](https://github.com/ManishKarki1997/SSR-Ecommerce-App)

##### 2. Rename the .env.example file to .env only

It should look like this

```
DATABASE_URL = <postgres db url - looks something like this 'postgresql://username:password@localhost:5432/varyacommerce?schema=public'>
EMAIL = <needed to send password reset links>
GMAIL_PASSWORD =
JWT_SECRET_KEY = randomjwtsecretkey278&23*2#$!132@#@
ACCOUNT_ACTIVATION_TOKEN_EXPIRY_IN_HOURS = 6
STRIPE_PUBLISHABLE_KEY =
STRIPE_SECRET_KEY =
FRONTEND_URL = <e.g. http://localhost:3000>
```

If you intend to use Stripe, fill in the Stripe variables from stripe dashboard

##### 3. Install the dependencies and devDependencies and start the server.

```sh
npm install
npm run dev
```

##### 4. App should be running in http://localhost:4000
