# DANDIYA RAAT 2026 — Narapally Cricket Ground, Hyderabad
### Official Full-Stack Festival Web Application & Ticketing Platform

A modern cultural festival platform built with **React**, **Vite**, **Tailwind CSS**, and **Firebase Firestore (Plug-and-Play)**. Implements the **Nocturne Dandiya Raat '26** editorial poster aesthetic.

---

## 🌟 Key Updates & Features

### 1. Google Authentication & Pass Association
- Attendees sign in with their Google accounts (`Sign in with Google`).
- All passes and tickets purchased are automatically associated with the logged-in user's account (`userId` and `userEmail`).
- In **My Passes Wallet** (`#/my-passes`), attendees automatically see all passes associated with their Google account.

### 2. Role-Based Access Control for Admin
- The **Admin Portal** (`#/admin`) is strictly gated:
  - If a visitor is not logged in: Access is restricted, prompting Google Sign-In.
  - If a user is logged in with a general `user` role: A **403 Forbidden - Admin Role Required** guard blocks access.
  - Only accounts assigned the `admin` role in the database can access the portal.
  - Admin accounts can grant or revoke the `admin` role for other Google accounts in the Admin panel.

### 3. Full-Fledged CMS: Edit Every Content, Text & Image Live
In the Admin Portal (`#/admin` > **EDIT CONTENT & IMAGES** tab), administrators can live-edit:
1. **Hero & Logo**: Announcement banner, tagline, festival logo URL, hero background image URL, countdown target date, and intro description.
2. **15 October Date Section**: Date number, month, year subtitle, hours, and subtext.
3. **Folk Manifesto**: Main heading, subheading, quote, and the 4 pillars (Dandiya, Garba, Dhol, Rasoi).
4. **Realms Carousel**: Card titles, subtitle tags, descriptions, and image links.
5. **Venue & Google Maps**: Venue title, location name, address, and Google Maps URL (`https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9`).
6. **Weather Advisory**: Money-back guarantee banner title, text, and policy badge.
7. **Organisers Contacts**: Names, phone numbers, and roles.
8. **FAQ Policies**: Add, edit, or delete questions and answers.
- Includes a **Save Live Content** button that updates the website immediately without reloading, and a **Reset Defaults** safety button.

### 4. Venue Section with Original Google Maps
- Interactive Google Maps embedded in the venue section.
- Direct links to: [https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9](https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9).

### 5. Streamlined Header & Compact Mobile Drawer
- Clean, uncluttered 64px header.
- Audio synthesizer removed as requested.
- Compact slide-out drawer on mobile (width: 288px) with clean navigation and user account card.

---

## 🚀 Running the App

### Dev Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build
```bash
npm run build
```
"# dandiyaraath" 
