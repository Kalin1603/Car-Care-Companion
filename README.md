# ServiX - Car Care Companion

A comprehensive web application for managing and tracking car repairs and services with AI-powered diagnostics and premium subscription features.

## Features

### Authentication System
- **OAuth Integration**: Google, Facebook, Twitter/X, and Apple Sign-In
- **Traditional Auth**: Email/password registration and login
- **Security**: JWT token handling, session management, password reset
- **Modern UI**: Glassmorphism design, smooth animations, accessibility compliant

### Subscription Management
- **Multiple Tiers**: Basic (Free), Pro ($9.99/month), Premium ($19.99/month)
- **Payment Processing**: Integrated payment system with Stripe-like functionality
- **Feature Gating**: AI diagnostics and advanced features for paid tiers
- **Subscription Management**: Upgrade, downgrade, and cancellation

### Core Functionality
- **Service Tracking**: Complete maintenance history with unlimited records (Pro+)
- **AI Diagnostics**: Intelligent problem analysis and cost estimation (Pro+)
- **Multi-language Support**: English, Bulgarian, Spanish, German, French
- **Currency Support**: USD and EUR with real-time conversion
- **Responsive Design**: Mobile-first approach with dark/light themes

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for development and building
- **CSS Custom Properties** for theming
- **Material Symbols** for icons
- **Context API** for state management

### Backend Services
- **Google Gemini AI** for diagnostics and advice
- **LocalStorage** for data persistence (demo)
- **Session Management** for authentication

### Design System
- **Modern CSS**: Glassmorphism, subtle animations, micro-interactions
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first design with breakpoints
- **Theme Support**: Dark/light mode with smooth transitions

## Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd car-care-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthScreen.tsx   # Enhanced authentication
│   ├── SubscriptionModal.tsx  # Payment and plans
│   └── ...
├── contexts/           # React contexts
│   ├── ThemeContext.tsx
│   ├── I18nContext.tsx
│   └── ...
├── services/           # Business logic
│   ├── authService.ts
│   ├── subscriptionService.ts
│   ├── apiService.ts
│   └── ...
├── i18n/              # Internationalization
├── hooks/             # Custom React hooks
└── types.ts           # TypeScript definitions
```

## API Integration

### Google Gemini AI
The application integrates with Google's Gemini AI for:
- **Service Advice**: Cost estimation and maintenance tips
- **Diagnostics**: Problem analysis and repair recommendations
- **Multi-language**: Responses in user's preferred language

### Payment Processing
Simulated payment system with:
- **Card Processing**: Visa, MasterCard, American Express
- **Subscription Management**: Automatic renewals and cancellations
- **Billing History**: Transaction records and invoices

## Subscription Tiers

### Basic (Free)
- Track up to 5 services
- Basic service history
- Manual data entry
- Email support

### Pro ($9.99/month)
- Unlimited service tracking
- AI-powered diagnostics
- Smart maintenance reminders
- Advanced analytics
- Priority support
- Data export

### Premium ($19.99/month)
- Everything in Pro
- Multi-vehicle support
- Custom maintenance schedules
- Integration with service centers
- Dedicated account manager
- White-label options

## Security Features

- **Session Management**: Secure token-based authentication
- **Data Validation**: Input sanitization and validation
- **HTTPS Ready**: SSL/TLS encryption support
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention

## Accessibility

- **WCAG 2.1 AA Compliant**: Screen reader support, keyboard navigation
- **High Contrast**: Sufficient color contrast ratios
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading structure and landmarks

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@servix.app
- Documentation: [docs.servix.app](https://docs.servix.app)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## Roadmap

- [ ] Real Stripe integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with OBD-II devices
- [ ] Maintenance scheduling automation
- [ ] Service center partnerships

---

Built with ❤️ using React, TypeScript, and modern web technologies.