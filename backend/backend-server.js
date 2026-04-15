// Site Monitoring Software - Backend Server
// Node.js + Express + Anthropic Claude API

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
});

// In-memory data store (replace with database in production)
let projects = [];

// Load projects from file on startup
async function loadProjects() {
  try {
    const data = await fs.readFile('projects-data.json', 'utf8');
    projects = JSON.parse(data);
    console.log('Projects loaded from file');
  } catch (error) {
    console.log('No existing projects file, starting fresh');
    projects = [];
  }
}

// Save projects to file
async function saveProjects() {
  try {
    await fs.writeFile('projects-data.json', JSON.stringify(projects, null, 2));
    console.log('Projects saved to file');
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

// ===== API ENDPOINTS =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Site Monitoring Software API is running' });
});

// Get all projects
app.get('/api/projects', (req, res) => {
  res.json({ projects });
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project });
});

// Create new project
app.post('/api/projects', async (req, res) => {
  const { name, address, type, items } = req.body;
  
  const newProject = {
    id: 'project-' + Date.now(),
    name,
    address: address || '',
    type: type || 'General',
    createdDate: new Date().toISOString(),
    items: items || []
  };
  
  projects.push(newProject);
  await saveProjects();
  
  res.json({ project: newProject });
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...req.body,
    id: req.params.id // Ensure ID doesn't change
  };
  
  await saveProjects();
  res.json({ project: projects[projectIndex] });
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  projects.splice(projectIndex, 1);
  await saveProjects();
  
  res.json({ success: true });
});

// ===== AI GENERATION ENDPOINTS =====

// Generate checklist with AI (text only)
app.post('/api/ai/generate-checklist', async (req, res) => {
  const { description } = req.body;
  
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a construction and repair project management expert. Based on the following project description, generate a detailed checklist of tasks/items that need to be completed.

Project Description: ${description}

Return your response as a JSON array of objects, where each object has these fields:
- title: Brief task title
- description: Detailed description of the task
- contractor: Type of contractor needed (e.g., "Licensed electrician", "General contractor")
- category: Category/area (e.g., "Electrical", "Plumbing", "Exterior")
- priority: "high", "medium", or "low"

Return ONLY the JSON array, no other text. Example format:
[{"title":"Roof inspection","description":"Complete assessment","contractor":"Licensed roofer","category":"Roof","priority":"high"}]`
      }]
    });
    
    const responseText = message.content[0].text;
    const items = JSON.parse(responseText);
    
    res.json({ items });
    
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate checklist',
      message: error.message 
    });
  }
});

// Generate checklist with AI (with file upload)
app.post('/api/ai/generate-from-files', upload.array('files', 10), async (req, res) => {
  const { description } = req.body;
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'At least one file is required' });
  }
  
  try {
    // Read file contents
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file.path, 'utf8');
        return {
          name: file.originalname,
          content: content.substring(0, 5000) // Limit to first 5000 chars
        };
      })
    );
    
    // Create prompt with file contents
    let prompt = `You are a construction and repair project management expert. I'm uploading documents related to a project. Based on these documents, generate a detailed checklist of repair/construction items.\n\n`;
    
    fileContents.forEach(file => {
      prompt += `File: ${file.name}\nContent:\n${file.content}\n\n`;
    });
    
    if (description && description.trim()) {
      prompt += `\nAdditional context: ${description}\n\n`;
    }
    
    prompt += `Return your response as a JSON array of objects, where each object has:
- title: Brief task title
- description: Detailed description
- contractor: Type of contractor needed
- category: Category/area
- priority: "high", "medium", or "low"

Return ONLY the JSON array, no other text.`;
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseText = message.content[0].text;
    const items = JSON.parse(responseText);
    
    // Clean up uploaded files
    await Promise.all(files.map(file => fs.unlink(file.path)));
    
    res.json({ items });
    
  } catch (error) {
    console.error('AI generation from files error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      await Promise.all(req.files.map(file => 
        fs.unlink(file.path).catch(() => {})
      ));
    }
    
    res.status(500).json({ 
      error: 'Failed to generate checklist from files',
      message: error.message 
    });
  }
});

// ===== START SERVER =====

loadProjects().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🏗️  Site Monitoring Software - Backend Server         ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   API Endpoint: http://localhost:${PORT}/api              ║
║                                                           ║
║   Ready to accept requests!                               ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, saving projects and shutting down...');
  await saveProjects();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, saving projects and shutting down...');
  await saveProjects();
  process.exit(0);
});
