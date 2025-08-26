
# Address Validator

 Next.js application for validating Australian addresses and searching locations using the Australia Post API. Features real-time logging, interactive maps, and persistent state management.

 ## Features

- Address validation for Australian postcodes, suburbs, and states
- Location search with category filtering
- Interactive maps using Leaflet and OpenStreetMap
- Activity logging with Elasticsearch integration
- State persistence across browser sessions
- Modern UI with shadcn/ui components

## Tech Stack

- Next.js 15 with TypeScript
- Tailwind CSS and shadcn/ui
- Zustand for state management
- Apollo Client and GraphQL
- Leaflet for maps
- Elasticsearch for logging

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```
### 2. Environment Configuration
Copy the example environment file and add your credentials:
```bash
cp .env.example .env.local
```
Edit .env.local and replace the placeholder values with your actual API credentials. You can reference the .env.example file for the required variables.
### 2. Run the Application
```bash
npm run dev
```
Open http://localhost:3000 in your browser.
## Usage

### Verifier Tab
Enter a postcode, suburb, and state to validate the address combination.  
Valid combinations will display a success message and show the location on the map.

### Source Tab
Search for locations within suburbs or postcodes.  
Results can be filtered by category, and clicking on a location will display it on the map.

### Logs Tab
View all logged user interactions stored in Elasticsearch.  
Logs can be filtered by tab type and refreshed in real-time.

---

## Test Cases

### Valid Examples
- VIC, Melbourne, 3000  
- NSW, Broadway, 2007  
- QLD, Brisbane, 4000  

### Invalid Examples (Expected Errors)
- **VIC, Broadway, 2007** → "The postcode 2007 does not match the suburb Broadway"  
- **TAS, Ferntree Gully, 3156** → "The postcode 3156 does not match the suburb Ferntree Gully"  

---

## Available Scripts

- `npm run dev` - Start development server  
- `npm run build` - Build for production  
- `npm run start` - Start production server  
- `npm run lint` - Run linting  
- `npm run format` - Format code with Prettier  

---

## API Endpoints

- `/api/australia-post` → Search locations  
- `/api/graphql` → GraphQL proxy for validation  
- `/api/log` → Store activity logs  
- `/api/logs` → Retrieve activity logs  

