# Curio Corner Commerce

Production-ready handmade crafts eCommerce platform with a public storefront, separate secure admin app, and Node/Express/Mongo REST API.

## Apps

- `frontend/` - public React + Vite storefront.
- `admin/` - separate React + Vite admin panel. Login route: `/admin`.
- `backend/` - Express REST API with JWT auth, bcrypt, Helmet, rate limiting, validation, MongoDB models, and Cloudinary upload support.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `backend/.env` from `backend/.env.example`.

3. Seed the first admin account:

   ```bash
   npm run seed:admin
   ```

4. Start development servers:

   ```bash
   npm run dev:backend
   npm run dev:frontend
   npm run dev:admin
   ```

   Local URLs:

   - Public storefront: `http://localhost:5173/`
   - Secure admin login: `http://localhost:5174/admin`
   - API health check: `http://localhost:5000/api/health`

## Deployment

- Public storefront from repo root on Vercel:
  - Build command: `npm --workspace frontend run build`
  - Output directory: `frontend/dist`
  - The root `vercel.json` already sets these values.
- Admin panel as a separate Vercel project:
  - Root directory: `admin`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Login route: `/admin`
- Backend as a separate Vercel project or Node host:
  - Root directory: `backend`
  - Set all values from `backend/.env.example` in Vercel Environment Variables.
- Set `VITE_API_URL` in both frontend/admin deployments to your backend URL.

## Security Notes

The API includes JWT authentication, bcrypt password hashing, request validation, Helmet, CORS allowlists, rate limiting, MongoDB sanitization, XSS sanitization, and protected admin routes. Public registration is intentionally not implemented.
