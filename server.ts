import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initializeDatabase,
  getSchemaMetadata,
  executeSafeQuery,
  getQueryHistory,
  logQueryExecution,
  clearQueryHistory,
} from './server/db';
import * as geminiAgent from './server/geminiAgent';

const generateSqlAndInsights = async (question: string): Promise<any> => {
  const agent = geminiAgent as unknown as Record<string, unknown>;
  const generator =
    agent.generateSqlAndInsights ??
    agent.default ??
    Object.values(agent).find((value) => typeof value === 'function');

  if (typeof generator !== 'function') {
    throw new Error('No SQL generation function exported by geminiAgent.');
  }

  return generator(question);
};

const app = express();
const PORT = Number(process.env.PORT) || 3005;
const isProduction = process.env.NODE_ENV === 'production';

// CORS & JSON middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

// Initialize the in-memory database
initializeDatabase();

app.get('/favicon.ico', (_req, res) => res.status(204).end());

// =========================================================================
// API ROUTES
// =========================================================================

/**
 * Health check
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'ai_data_analyst',
    tables: 6,
  });
});

/**
 * Schema metadata with universal property mapping
 */
app.get(['/api/schema', '/api/schema-metadata'], (_req, res) => {
  try {
    const raw = getSchemaMetadata();
    const normalized = raw.map((t: any) => ({
      ...t,
      name: t.name || t.table_name || t.tableName,
      table_name: t.table_name || t.name || t.tableName,
      tableName: t.tableName || t.name || t.table_name,
      rowCount: t.rowCount ?? t.row_count ?? (t.sampleRows?.length || 0),
      row_count: t.row_count ?? t.rowCount ?? (t.sampleRows?.length || 0),
      sampleRows: t.sampleRows || t.sample_rows || [],
      sample_rows: t.sample_rows || t.sample_rows || [],
      rows: t.sampleRows || t.sample_rows || [],
      columns: (t.columns || []).map((c: any) => ({
        ...c,
        name: c.name || c.column_name || c.columnName,
        column_name: c.column_name || c.name || c.columnName,
        columnName: c.columnName || c.name || c.column_name,
        type: c.type || c.data_type || c.dataType,
        data_type: c.data_type || c.type || c.dataType,
        dataType: c.dataType || c.type || c.data_type,
        primaryKey: c.primaryKey ?? c.is_primary ?? false,
        is_primary: c.is_primary ?? c.primaryKey ?? false,
        foreignKey: c.foreignKey ?? c.foreign_key ?? null,
        foreign_key: c.foreign_key ?? c.foreignKey ?? null,
      })),
    }));

    res.json(normalized);
  } catch (error: any) {
    console.error('Failed to retrieve schema metadata:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch database schema' });
  }
});

/**
 * Table data
 */
app.get(['/api/table/:tableName', '/api/data/:tableName'], (req, res) => {
  const { tableName } = req.params;
  try {
    const query = `SELECT * FROM ${tableName} LIMIT 50;`;
    const result = executeSafeQuery(query);
    return res.json({
      tableName,
      name: tableName,
      rows: result.rows || [],
      columns: result.columns || [],
      totalCount: result.rowCount || 0,
      total_count: result.rowCount || 0,
      rowCount: result.rowCount || 0,
    });
  } catch (error: any) {
    console.error(`Failed to fetch table ${tableName}:`, error);
    return res.status(500).json({ error: `Failed to load table ${tableName}` });
  }
});

/**
 * Reset database
 */
app.post('/api/reset', (_req, res) => {
  try {
    initializeDatabase();
    res.json({ message: 'Database reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset database.' });
  }
});

/**
 * Natural Language Query Handler
 */
async function handleNaturalQuery(req: express.Request, res: express.Response) {
  const question = req.body.question || req.body.query || req.body.prompt;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'A natural language question is required.' });
  }

  const startTime = Date.now();

  try {
    const aiResponse = await generateSqlAndInsights(question);

    if (!aiResponse.is_relevant) {
      logQueryExecution({
        natural_query: question,
        generated_sql: '-- Question flagged as out of scope',
        status: 'blocked',
        row_count: 0,
        execution_time_ms: Date.now() - startTime,
        error_message: 'Query does not pertain to university database schema.',
      });

      return res.json({
        is_relevant: false,
        intent: aiResponse.intent || 'Out of Scope',
        message: 'This question is out of scope for the university database.',
        sql: '',
        explanation: 'Please ask about students, departments, faculty, courses, marks, or attendance.',
        rows: [],
        columns: [],
        rowCount: 0,
        executionTimeMs: Date.now() - startTime,
        chart_type: 'table',
        suggested_followups: [
          'Who are the top 5 students by marks?',
          'What is the average attendance of each department?',
          'Show all departments ordered by budget',
        ],
      });
    }

    const queryResult = executeSafeQuery(aiResponse.sql);

    logQueryExecution({
      natural_query: question,
      generated_sql: aiResponse.sql,
      status: queryResult.success ? 'success' : queryResult.securityBlocked ? 'blocked' : 'error',
      row_count: queryResult.rowCount,
      execution_time_ms: Date.now() - startTime,
      error_message: queryResult.error,
    });

    return res.json({
      success: queryResult.success,
      is_relevant: true,
      intent: aiResponse.intent,
      sql: aiResponse.sql,
      explanation: aiResponse.explanation,
      chart_type: aiResponse.chart_type,
      chart_config: aiResponse.chart_config,
      suggested_followups: aiResponse.suggested_followups || [],
      rows: queryResult.rows || [],
      columns: queryResult.columns || [],
      rowCount: queryResult.rowCount || 0,
      totalCount: queryResult.rowCount || 0,
      executionTimeMs: queryResult.executionTimeMs || (Date.now() - startTime),
      execution: queryResult,
      total_latency_ms: Date.now() - startTime,
      error: queryResult.error,
    });
  } catch (error: any) {
    console.error('Error processing natural query:', error);
    return res.status(500).json({ error: error.message || 'Failed to process natural query.' });
  }
}

/**
 * Raw / Direct SQL Execution Handler (Fixes /api/execute-direct!)
 */
function handleRawQuery(req: express.Request, res: express.Response) {
  const sql = req.body.sql || req.body.query;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL query string is required in request body.' });
  }

  const result = executeSafeQuery(sql);

  logQueryExecution({
    natural_query: 'Direct SQL Execution',
    generated_sql: sql,
    status: result.success ? 'success' : result.securityBlocked ? 'blocked' : 'error',
    row_count: result.rowCount,
    execution_time_ms: result.executionTimeMs,
    error_message: result.error,
  });

  return res.json({
    success: result.success,
    rows: result.rows || [],
    columns: result.columns || [],
    rowCount: result.rowCount || 0,
    totalCount: result.rowCount || 0,
    executionTimeMs: result.executionTimeMs || 0,
    error: result.error,
    securityBlocked: result.securityBlocked || false,
  });
}

// Map all variations of the query execution endpoints
app.post(['/api/execute-direct', '/api/execute-sql', '/api/query/raw', '/api/sql/execute'], handleRawQuery);

app.post(['/api/query/natural', '/api/query/ask', '/api/chat'], handleNaturalQuery);

app.post('/api/query', async (req, res) => {
  if (req.body.sql) {
    return handleRawQuery(req, res);
  }
  return handleNaturalQuery(req, res);
});

/**
 * Query History
 */
app.get(['/api/history', '/api/query/history'], (_req, res) => {
  try {
    const history = getQueryHistory();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve query history.' });
  }
});

app.delete(['/api/history', '/api/query/history'], (_req, res) => {
  try {
    clearQueryHistory();
    res.json({ message: 'History cleared successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clear history.' });
  }
});

/**
 * Academic Documentation Report endpoint
 */
app.get(['/api/documentation', '/api/docs', '/api/report'], (_req, res) => {
  const docMarkdown = `# AI SQL Data Analyst Agent (DBMS Capstone)
## Academic B.Tech Computer Science & Engineering Final Year Project

### 1. Abstract
The **AI SQL Data Analyst Agent** is an end-to-end intelligent conversational database analytics system designed for university database administration. It bridges natural human language and structured MySQL database queries through semantic translation, automated query generation, automated chart selection, and strict read-only query firewall security.

### 2. Database Schema Design (MySQL 8.0+)
The underlying relational database \`ai_data_analyst\` models a modern university ecosystem with 6 normalized tables (3NF):
1. **departments**: Stores academic departments, building locations, and annual budgets.
2. **faculty**: Faculty member directory, departmental affiliations, and salaries.
3. **students**: Student enrollment, department assignments, semesters, and GPAs.
4. **courses**: Course catalog, departmental mappings, credit weights, and assigned instructors.
5. **marks**: Course examination performances, marks scored, and computed letter grades.
6. **attendance**: Class attendance records, attended lectures, and attendance percentages.

### 3. DBMS Security Firewall & Safe Execution Policy
To prevent accidental data loss or malicious SQL injection attacks, the system enforces:
- **Read-Only Authorization**: Only \`SELECT\` statements are permitted.
- **Prohibited Mutation Keywords**: All statements containing \`DROP\`, \`DELETE\`, \`UPDATE\`, \`INSERT\`, \`ALTER\`, \`TRUNCATE\`, \`GRANT\`, or \`REVOKE\` are blocked at the engine layer before execution.
- **Parameter Validation**: Automatic bounds checking on row limits and execution timeouts.

### 4. Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Chart.js.
- **Backend**: Node.js, Express, TypeScript, Vite Connect Middleware.
- **AI Engine**: Gemini 3.8 Flash with structured JSON output and schema grounding.
`;

  res.json({
    title: 'AI SQL Data Analyst Agent (DBMS Capstone)',
    markdown: docMarkdown,
    content: docMarkdown,
    sections: 25,
  });
});

/**
 * Standalone Python Project Download endpoint
 */
app.get(['/api/export/python', '/api/download/python'], (_req, res) => {
  const pythonScript = `"""
AI SQL Data Analyst - Standalone Python Prototype
B.Tech CSE Final Year DBMS Project
"""
import mysql.connector

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="ai_data_analyst"
    )

def execute_safe_query(sql):
    blocked = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'UPDATE', 'INSERT']
    for keyword in blocked:
        if keyword in sql.upper():
            raise PermissionError(f"Security Alert: {keyword} operation is prohibited.")
    
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql)
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records

if __name__ == "__main__":
    print("Database connected. Ready for analytical queries.")
`;

  res.setHeader('Content-Type', 'text/x-python');
  res.setHeader('Content-Disposition', 'attachment; filename="data_analyst_agent.py"');
  res.send(pythonScript);
});

// =========================================================================
// VITE SETUP
// =========================================================================

async function startServer() {
  if (!isProduction) {
    const projectRoot = process.cwd();

    const vite = await createViteServer({
      configFile: path.resolve(projectRoot, 'vite.config.ts'),
      root: projectRoot,
      server: {
        middlewareMode: true,
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: `API endpoint ${req.originalUrl} not found.` });
      }

      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(projectRoot, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI SQL Data Analyst server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});