# Brand Tracker SaaS

A comprehensive brand monitoring platform that tracks your brand mentions across AI-powered search results in real-time.

## 🚀 Features

- **Real-time Brand Monitoring**: Track brand mentions across various online sources
- **AI-Powered Detection**: Advanced natural language processing for accurate brand detection
- **Analytics Dashboard**: Comprehensive insights and analytics
- **Source Tracking**: Identify and track exact sources with clickable links
- **Competitive Analysis**: Compare your brand performance against competitors
- **User Authentication**: Secure signup/signin with Supabase Auth
- **Modern UI**: Beautiful, responsive design with shadcn/ui components
- **API Integration**: RESTful API for custom integrations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 API
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/RakeshKakati/llm-brand-tracker-saas.git
cd llm-brand-tracker-saas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# RAG (Retrieval-Augmented Generation) - Optional Feature
# Set to 'true' to enable real-time RAG tracking (defaults to false)
ENABLE_RAG_TRACKING=false

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Brand Tracker"
```

### 4. Database Setup

Run the SQL script in your Supabase dashboard:

```bash
# Copy the contents of supabase-setup.sql and run in Supabase SQL editor
cat supabase-setup.sql
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── checkMention/  # Brand mention checking
│   │   ├── trackBrand/    # Brand tracking
│   │   └── cron/          # Scheduled tasks
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── lib/               # Utilities and configurations
├── components/            # React components
│   ├── pages/             # Page components
│   ├── ui/                # shadcn/ui components
│   └── data-table/        # Table components
└── hooks/                 # Custom React hooks
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL script from `supabase-setup.sql`
3. Get your project URL and anon key from Settings > API
4. Add them to your `.env.local` file

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file

## 📊 Database Schema

### Tables

- **users**: User profiles linked to Supabase Auth
- **tracked_brands**: Brand tracking configurations
- **brand_mentions**: Brand mention records and results

### Key Features

- Row Level Security (RLS) enabled
- Automatic user profile creation on signup
- Timestamp tracking with triggers

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 🔄 Cron Jobs

The application includes automated cron jobs for:

- Brand mention checking
- Data cleanup
- Analytics updates

Configure cron jobs in `.github/workflows/cron.yml` for GitHub Actions or set up server-side cron jobs.

## 📈 Features Overview

### Landing Page
- Modern, responsive design
- Interactive product showcase
- Pricing plans
- Testimonials and FAQ sections

### Authentication
- Secure signup/signin
- Password reset functionality
- User profile management

### Dashboard
- Real-time brand monitoring
- Analytics and insights
- Source tracking with clickable links
- Competitive analysis

### API Endpoints
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/auth/reset-password` - Password reset
- `/api/checkMention` - Brand mention checking
- `/api/trackBrand` - Brand tracking setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@brandtracker.com or create an issue in the GitHub repository.

## 🔗 Links

- [Live Demo](https://brandtracker.vercel.app)
- [Documentation](https://docs.brandtracker.com)
- [API Reference](https://api.brandtracker.com/docs)