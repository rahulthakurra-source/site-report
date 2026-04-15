# 🏗️ Site Monitoring Software

A full-stack web application for managing construction and repair projects with AI-powered checklist generation.

## 🎯 Features

- **Multi-Project Management** - Manage unlimited construction/repair projects
- **AI Checklist Generation** - Generate checklists using Claude AI
- **File Upload Support** - Upload inspection reports, PDFs, documents
- **Timeline Tracking** - Track work progress over multiple dates
- **Photo Documentation** - Attach photos to specific dates
- **Real-time Sync** - Frontend communicates with backend API
- **Data Persistence** - All data saved server-side

## 🏗️ Architecture

```
Site Monitoring Software/
├── backend-server.js       # Node.js/Express backend with Claude API
├── frontend.html           # React frontend (API client)
├── package.json           # Node.js dependencies
├── .env                   # API keys (create this)
└── README.md             # This file
```

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin requests
- `multer` - File uploads
- `@anthropic-ai/sdk` - Claude API client

### Step 2: Set Up API Key

Create a `.env` file:

```bash
echo "ANTHROPIC_API_KEY=your-actual-api-key-here" > .env
```

Or set environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Step 3: Start Backend Server

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║   🏗️  Site Monitoring Software - Backend Server         ║
║   Server running on: http://localhost:3000              ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 4: Open Frontend

Open `frontend.html` in your browser:

```bash
# On Mac
open frontend.html

# On Linux
xdg-open frontend.html

# On Windows
start frontend.html
```

Or simply double-click `frontend.html`

## 🚀 Usage

### Creating Projects

1. **Manual Project Creation**
   - Click "➕ New Project"
   - Enter project name, address, type
   - Add items manually

2. **AI-Generated Project**
   - Click "🤖 AI Generator"
   - Upload files (inspection reports, PDFs)
   - Or type project description
   - Click "Generate Checklist"
   - AI creates comprehensive checklist!

### Managing Checklists

1. Click on any project card to open
2. Check off completed items
3. Add timeline entries with dates
4. Upload photos for each date
5. Add notes and comments

### AI Generation Within Projects

1. Open a project
2. Click "🤖 AI Generate Items"
3. Upload new files or describe additions
4. AI adds items to existing project

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### AI Generation
- `POST /api/ai/generate-checklist` - Generate from text
  ```json
  {
    "description": "Kitchen renovation with new cabinets"
  }
  ```

- `POST /api/ai/generate-from-files` - Generate from files
  ```
  FormData with:
  - files: File[]
  - description: string (optional)
  ```

## 💾 Data Storage

Projects are stored in `projects-data.json` file. This auto-saves on:
- Project creation/update/delete
- Server shutdown (graceful)

**For production**: Replace with proper database (MongoDB, PostgreSQL, etc.)

## 🛠️ Development

### Run with Auto-reload

```bash
npm run dev
```

Uses `nodemon` to restart server on file changes.

### Project Structure

**Backend (`backend-server.js`)**
- Express REST API
- Claude API integration
- File upload handling
- Data persistence

**Frontend (`frontend.html`)**
- React SPA
- Fetch API for backend calls
- Local state management
- Responsive design

## 📝 Example AI Prompts

**Good prompts for AI generation:**
- "Kitchen renovation including cabinet installation, countertop replacement, and electrical updates"
- "Roof repair with shingle replacement and gutter cleaning"
- "Bathroom remodel with new tile, fixtures, and ventilation"
- Upload home inspection PDF for comprehensive checklist

**Files to upload:**
- Home inspection reports (PDF)
- Scope of work documents
- Contractor estimates
- Building permits
- Photos of issues

## 🔒 Security Notes

⚠️ **Important for Production:**

1. **API Key Security**
   - Never commit `.env` file
   - Use environment variables in production
   - Rotate keys regularly

2. **CORS Configuration**
   - Update CORS settings for production domain
   - Don't use `cors()` without restrictions in production

3. **File Upload Security**
   - Validate file types server-side
   - Limit file sizes (currently 10MB)
   - Scan uploaded files for malware

4. **Authentication**
   - Add user authentication (JWT, OAuth)
   - Implement per-user project isolation

5. **Database**
   - Use proper database (not JSON file)
   - Implement backup strategy

## 🐛 Troubleshooting

**"Failed to load projects" error:**
- Make sure backend server is running (`npm start`)
- Check console for errors
- Verify API_BASE_URL in frontend.html matches server

**"AI generation failed" error:**
- Check ANTHROPIC_API_KEY is set correctly
- Verify API key has credits
- Check backend console for detailed errors

**File upload not working:**
- Check file size (must be < 10MB)
- Verify file type is supported
- Check backend console logs

**Port 3000 already in use:**
```bash
# Change PORT in backend-server.js
# Or kill existing process
lsof -ti:3000 | xargs kill
```

## 📄 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Areas to improve:
- Database integration (MongoDB, PostgreSQL)
- User authentication system
- Better file processing (PDF text extraction)
- Mobile app version
- Real-time collaboration
- Export to PDF/Excel

## 💡 Tips

- Upload PDFs of inspection reports for best AI results
- Use descriptive project names for easy organization
- Take photos at each stage of work for documentation
- Add detailed notes to help track progress
- Use AI generator to expand projects as scope changes

---

**Need help?** Check the console logs for detailed error messages.
