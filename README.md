# Telehealth System - Medplum Integration

A React-based telehealth system built with Medplum for healthcare data management.

## Features

- **Medplum Integration**: Built-in support for FHIR-compliant healthcare data
- **Patient Management**: View and manage patient records
- **Authentication**: Medplum OAuth integration ready
- **TypeScript**: Full TypeScript support for type safety
- **Modern React**: Uses React 19 with hooks and functional components

## Prerequisites

- Node.js 18+ (you have Node.js 22.14.0 ✅)
- npm or pnpm
- Medplum account and client credentials

## Installation

The project is already set up with all dependencies installed:

```bash
# Dependencies are already installed
# @medplum/core, @medplum/react, react, react-dom, typescript
```

## Configuration

1. **Update Medplum Configuration**: Edit `src/index.tsx` and replace:
   ```typescript
   const medplum = new MedplumClient({
     baseUrl: 'https://api.medplum.com/', // Your Medplum server URL
     clientId: 'your-client-id', // Your actual client ID
   });
   ```

2. **Set up Authentication**: Implement OAuth flow for production use

## Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Running the Application

### Windows (PowerShell/Command Prompt)
```bash
npm run dev
```

### WSL (if you prefer Linux environment)
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Project Structure

```
telehealth-system/
├── src/
│   ├── index.tsx          # Main entry point
│   └── App.tsx            # Main application component
├── public/
│   └── index.html         # HTML template (legacy)
├── index.html             # Vite HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## Key Components

### App.tsx
- Demonstrates Medplum authentication
- Shows patient data fetching
- Includes error handling
- Responsive UI components

### index.tsx
- Initializes Medplum client
- Sets up React app with providers
- Handles root rendering

## Testing

### Windows Testing
```bash
# Run type checking
npm run type-check

# Start development server
npm run dev
```

### WSL Testing
```bash
# Same commands work in WSL
npm run type-check
npm run dev
```

## Next Steps

1. **Configure Medplum Credentials**: Add your actual client ID and server URL
2. **Implement OAuth**: Set up proper authentication flow
3. **Add More Features**: Extend with appointments, prescriptions, etc.
4. **Styling**: Add CSS framework or styled-components
5. **Error Boundaries**: Add React error boundaries for better error handling
6. **Testing**: Add unit and integration tests

## Medplum Resources

- [Medplum Documentation](https://www.medplum.com/docs)
- [FHIR Specification](https://www.hl7.org/fhir/)
- [Medplum React Components](https://www.medplum.com/docs/react)

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your client ID is correct
2. **CORS Issues**: Ensure your domain is whitelisted in Medplum
3. **TypeScript Errors**: Run `npm run type-check` to identify issues

### Windows-Specific Notes

- Uses PowerShell-compatible commands
- Vite dev server works on Windows 11
- VS Code integration ready

## License

ISC