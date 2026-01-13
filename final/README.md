# LendTrust 

A comprehensive social lending platform where users register and login to track items they lend to friends, family, and community members while building trusted lending relationships through accountability and transparency.

## Description

LendTrust enables users to:

- **Track Personal Inventory**: Create detailed item listings with names, categories (books, electronics, tools, sports equipment, kitchen items), conditions (excellent, good, fair, poor), estimated values, and special care instructions
- **Manage Lendings**: Lend items to platform users or external contacts, set terms including dates and deposits, and track active loans
- **Request Borrowings**: Browse public libraries, request items from trusted lenders, and manage borrowed items
- **Build Trust**: Earn trust scores (0-100) based on on-time returns, item conditions, transaction history, and ratings, with badges like "New User", "Reliable", "Trusted", and "Elite"
- **Activity Feed**: Stay updated on lending activity through the activity feed with notifications for requests, returns, and other events

## How to Use

### Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

### For Development

Run both the backend and frontend dev servers:

- Terminal 1: `npm run dev:services` (starts Express server on port 3000)
- Terminal 2: `npm run dev:client` (starts Vite dev server on port 5173)
- Visit `http://localhost:5173`

### User Registration and Login

1. Click "Create an account" to register with a username
2. Optionally add display name, email, and phone
3. Log in with your registered username (no password required)

### Special Users

- **Banned User**: Username "dog" will be denied access (insufficient permissions)
- **Admin User**: Username "admin" has admin privileges to view platform statistics

### Key Features Walkthrough

1. **Add Items**: Navigate to "My Items" and click "Add Item" to create your inventory
2. **Lend Items**: From item details or inventory, click "Lend" to start a lending arrangement
3. **Borrower Search**: Search for platform users when creating lendings, or manually enter contact info for external borrowers
4. **Accept/Negotiate Requests**: Pending borrowing requests appear in "Pending Requests"; you can accept, decline, or propose different terms (up to 3 negotiation rounds)
5. **Track Lendings**: View active lendings with due dates, overdue indicators, and extension requests
6. **Return Process**: Borrowers initiate returns, lenders confirm receipt and rate condition
7. **Browse Library**: Explore public items available for borrowing in "Discover"
8. **Activity Feed**: All notifications and activity updates are in the "Activity" page


## Fonts and Icons

### Google Fonts
- **Outfit** (primary font)
- **DM Sans** (secondary font)
- License: Open Font License (OFL)
- Source: https://fonts.google.com

### Google Material Icons
- Used for activity feed icons and UI elements
- Downloaded from: https://fonts.google.com/icons
- Stored locally in: `src/assets/icons/`
- License: Apache License 2.0

The Material Design Icons are licensed under the Apache License, Version 2.0. You may obtain a copy of the License at:
http://www.apache.org/licenses/LICENSE-2.0

Icons downloaded and stored as SVG files:
- send.svg (Send icon)
- check-circle.svg (Check circle icon)
- cancel.svg (Cancel icon)
- inventory.svg (Inventory icon)
- sync.svg (Sync icon)
- schedule.svg (Schedule icon)
- warning.svg (Warning icon)
- star.svg (Star icon)
- star-filled.svg (Star filled icon)
- star-outline.svg (Star outline icon)
- inbox.svg (Inbox icon)
- notifications.svg (Notifications icon)
- library-books.svg (Library books icon)
- handshake.svg (Handshake icon)

## Trust Score System

Users earn trust scores calculated from:
- On-time return rate (up to 30 points)
- User ratings (up to 15 points)
- Transaction history (up to 10 points)

**Trust Badges:**
- Elite: 95+ score
- Trusted: 85-94 score
- Reliable: 70-84 score
- New User: 50-69 score
- Caution: Below 50 score

## Project Info

**INFO6250 Project** - Created by Nishal Save ( NUID: 002039310 )
