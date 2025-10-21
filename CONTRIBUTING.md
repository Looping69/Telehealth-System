# Contributing to Telehealth System

Thank you for your interest in contributing to the Telehealth System! This document provides guidelines for contributing to this FHIR-compliant healthcare platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Recommended: 22.14.0 or later)
- Git
- Docker & Docker Compose (optional, for local FHIR server)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/telehealth-system.git
   cd telehealth-system
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```
   Application runs at: http://localhost:5173

3. **Optional: Local FHIR Server**
   ```bash
   npm run medplum:start
   ```

## 🏗️ Project Structure

```
src/
├── pages/                 # Healthcare pages (dual-mode)
│   ├── Dashboard/         # Mock data version
│   ├── Dashboard-Medplum/ # Live FHIR version
│   └── ...
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── config/                # Configuration files
├── utils/                 # Utility functions
└── types/                 # TypeScript type definitions
```

## 🔄 Dual-Mode Architecture

The system operates in two modes:
- **Mock Data Mode**: Uses comprehensive mock healthcare data
- **Live FHIR Mode**: Connects to Medplum FHIR server

When adding new features, ensure both modes are supported.

## 📝 Code Standards

### TypeScript
- 100% TypeScript coverage required
- Strict type checking enabled
- Use proper FHIR types from `@medplum/fhirtypes`

### Code Style
- Use ESLint and Prettier configurations
- Follow existing naming conventions
- Add JSDoc comments for functions
- Use descriptive variable names

### Component Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Follow Mantine UI design system
- Ensure responsive design

## 🧪 Testing

### Type Checking
```bash
npm run type-check
```

### Manual Testing
1. Test in Mock Data mode
2. Test in Live FHIR mode (if applicable)
3. Verify responsive design
4. Test error scenarios

## 🔒 Security Guidelines

- Never commit secrets or API keys
- Use environment variables for configuration
- Follow FHIR security best practices
- Implement proper input validation
- Use secure authentication patterns

## 📋 Pull Request Process

### Before Submitting
1. **Type Check**: `npm run type-check` passes
2. **Build**: `npm run build` succeeds
3. **Test**: Manual testing in both modes
4. **Documentation**: Update relevant docs

### PR Guidelines
- Use descriptive commit messages
- Reference related issues
- Include screenshots for UI changes
- Explain dual-mode considerations
- Update documentation if needed

### Commit Message Format
```
type(scope): description

Examples:
feat(patients): add patient search functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

## 🏥 Healthcare-Specific Guidelines

### FHIR Compliance
- Use proper FHIR resource types
- Follow FHIR R4 specification
- Implement proper resource relationships
- Use standard FHIR terminologies

### Data Handling
- Respect patient privacy (HIPAA considerations)
- Use proper data validation
- Implement audit logging
- Handle sensitive data appropriately

### User Experience
- Design for healthcare workflows
- Consider accessibility requirements
- Implement proper error handling
- Provide clear user feedback

## 🐛 Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Mode (Mock Data vs Live FHIR)
- Screenshots if applicable

## 💡 Feature Requests

For new features, consider:
- Healthcare workflow impact
- FHIR compliance requirements
- Dual-mode implementation
- Security implications
- User experience design

## 📚 Resources

### FHIR & Healthcare
- [FHIR R4 Specification](https://www.hl7.org/fhir/)
- [Medplum Documentation](https://www.medplum.com/docs)
- [Healthcare Data Standards](https://www.healthit.gov/standards-advisory)

### Development
- [React 19 Documentation](https://react.dev/)
- [Mantine UI Components](https://mantine.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

By contributing, you agree that your contributions will be licensed under the ISC License.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional standards
- Consider healthcare context and sensitivity

## 📞 Getting Help

- Open an issue for bugs or questions
- Check existing documentation
- Review similar implementations
- Ask for clarification on healthcare workflows

---

**Thank you for contributing to healthcare innovation! 🏥❤️**