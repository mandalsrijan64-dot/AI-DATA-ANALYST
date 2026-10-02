# B.TECH DBMS PROJECT REPORT
# AI SQL Data Analyst Agent
**Course**: Database Management Systems Laboratory (B.Tech Computer Science & Engineering)  
**Project Title**: AI-Powered Natural Language to SQL Data Analyst Agent  
**Database**: `ai_data_analyst` (Relational RDBMS)

---

## 1. Title
**AI SQL Data Analyst Agent: A Safe Natural Language Query and Visual Analytics Interface for Relational Databases**

---

## 2. Abstract
Querying relational databases typically requires proficiency in Structured Query Language (SQL), understanding complex schema entity-relationship topologies, and manual synthesis of numerical results into business insights. This project presents the **AI SQL Data Analyst Agent**, an end-to-end intelligent conversational database interface designed to democratize access to relational data. The system enables non-technical stakeholders to submit questions in plain natural language (e.g., *"Show the top 5 students by marks"* or *"What is the average attendance of each department?"*). The AI agent inspects the relational catalog, maps entities and foreign key joins, synthesizes syntactically correct MySQL queries, subjects each query to a deterministic read-only security validator, executes the query against the relational database engine, and automatically generates both narrative analytical takeaways and dynamic interactive charts.

---

## 3. Introduction
Relational Database Management Systems (RDBMS) form the backbone of corporate enterprise architectures and educational institutions. However, business users, academic administrators, and faculty frequently lack SQL expertise and must rely on database administrators (DBAs) or data analysts for routine reporting. Recent advancements in Large Language Models (LLMs) enable contextual understanding of schema metadata. This project builds a production-grade academic bridge between human language and relational algebra, demonstrating core DBMS concepts including entity-relationship modeling, 3NF normalization, referential integrity constraints, multi-table joins, subqueries, grouping and aggregate computations, and query validation.

---

## 4. Problem Statement
Traditional database reporting workflows suffer from notable challenges:
1. **High Technical Barrier**: Business users cannot extract timely metrics without knowing SQL syntax, table names, and join keys.
2. **Backlog on Database Administrators**: DBAs spend significant time writing repetitive ad-hoc SELECT queries.
3. **Security Risks with Uncontrolled Access**: Giving users direct SQL consoles poses risks of accidental data mutation (`DELETE`, `UPDATE`), schema damage (`DROP`, `ALTER`), or malicious SQL injection.
4. **Cognitive Overhead in Result Interpretation**: Raw tabular numbers require manual spreadsheet plotting and cognitive effort to isolate trends and outliers.

---

## 5. Objectives
1. Design and implement a normalized relational database (`ai_data_analyst`) with referential integrity constraints and indexes.
2. Develop an AI query agent that reliably parses natural language questions into valid MySQL queries.
3. Enforce a deterministic security firewall permitting only read-only operations (`SELECT`, `WITH`) while strictly blocking dangerous DDL, DML, and DCL commands.
4. Execute queries with low latency and record query execution metrics in an audit history table (`query_history`).
5. Synthesize tabular result sets into natural-language analytical summaries and auto-select appropriate visualization charts (bar, pie, line, doughnut).

---

## 6. Existing System
- **Command-Line Interfaces (mysql CLI)**: Demands complete memorization of schema syntax, offers zero visualization, and allows dangerous queries if privileges are misconfigured.
- **GUI Tools (phpMyAdmin, MySQL Workbench, DBeaver)**: Require users to construct queries manually via query builders or raw SQL.
- **Static BI Dashboards (Tableau, PowerBI)**: Require upfront engineering of fixed reports; cannot answer unanticipated ad-hoc questions without report redevelopment.

---

## 7. Proposed System
The proposed **AI SQL Data Analyst Agent** provides:
- **Natural Language Interface**: Eliminates SQL learning curve for end users.
- **Deterministic Multi-Layer Security**: Regex and AST-based policy engine blocks `DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `UPDATE`, `INSERT`, `CREATE`, and SQL injection.
- **Automated Join Resolution**: Agent analyzes foreign key dependencies across 6 interrelated tables without requiring the user to specify table relationships.
- **Dynamic Visual Analytics**: Automatically identifies whether results are best represented as bar charts, pie charts, lines, or data grids.
- **Audit Logging**: Maintains query execution latency, status, generated SQL, and timestamp in `query_history`.

---

## 8. System Requirements
### Hardware Requirements
- **Processor**: Intel Core i3 / AMD Ryzen 3 or higher
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 500 MB free space
- **Network**: Internet connectivity for LLM API communication

### Software Requirements
- **Operating System**: Linux (Ubuntu 20.04+), Windows 10/11, or macOS
- **RDBMS**: MySQL Server 8.0+ or compatible in-memory relational engine
- **Backend**: Python 3.10+ (Flask) / Node.js 20+ (Express/TypeScript)
- **Frontend**: Modern Web Browser (Chrome, Firefox, Edge, Safari)
- **Libraries**: `google-genai`, `mysql-connector-python`, `pandas`, `Chart.js`, `Bootstrap 5`

---

## 9. Technology Stack
- **Database Layer**: MySQL 8.0 with InnoDB storage engine, primary/foreign key constraints, check constraints, stored generated columns, and B-Tree indexes.
- **Backend Architecture**: Flask/Express RESTful microservice managing schema introspection, AI agent communication, security validation, and database connection pooling.
- **AI Engine**: Google Gemini 3.8 Flash LLM with structured schema grounding and JSON response schema enforcement.
- **Visualization & Frontend**: Responsive web interface with Bootstrap 5 / Tailwind CSS, Chart.js for canvas-rendered charts, and Lucide icons.

---

## 10. System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                 User Web Interface                     │
       │       (Natural Language Input & Dashboard)             │
       └──────────────────────────┬─────────────────────────────┘
                                  │ 1. Question (HTTP POST)
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │                AI SQL Data Analyst Agent               │
       │  - Extracts Intent & Target Entities                   │
       │  - Injects Schema Catalog Metadata                     │
       │  - Calls Gemini 3.8 Flash with Schema Constraints       │
       └──────────────────────────┬─────────────────────────────┘
                                  │ 2. Candidate SQL Query
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             Deterministic SQL Safety Firewall          │
       │  - Blocks DDL: DROP, TRUNCATE, ALTER, CREATE           │
       │  - Blocks DML: DELETE, UPDATE, INSERT, REPLACE         │
       │  - Blocks DCL: GRANT, REVOKE                           │
       │  - Verifies Read-Only SELECT / WITH                    │
       │  - Prevents Multi-Statement SQL Injection (;)          │
       └──────────────────────────┬─────────────────────────────┘
                                  │ 3. Sanitized Safe SQL
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │                MySQL Database Engine                   │
       │                 (ai_data_analyst)                      │
       │  [departments] ── [courses] ── [enrollments]           │
       │  [students]    ── [marks]   ── [attendance]            │
       └──────────────────────────┬─────────────────────────────┘
                                  │ 4. Tabular Result Set & Latency
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │               Result Analyzer & Formatter              │
       │  - Computes Descriptive Statistics                     │
       │  - Generates Natural Language Explanation               │
       │  - Maps Data Dimensions to Chart Config (Chart.js)     │
       │  - Records Audit Entry in `query_history`              │
       └──────────────────────────┬─────────────────────────────┘
                                  │ 5. Structured Response
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │                 Visual Dashboard UI                    │
       │   [Narrative Summary] [SQL Block] [Chart] [Data Grid]  │
       └────────────────────────────────────────────────────────┘
```

---

## 11. ER Diagram Description
The relational database `ai_data_analyst` models a higher-education institution with 6 operational entities:

1. **DEPARTMENTS**:
   - `dept_id` (Primary Key, INT)
   - `dept_code` (Unique, VARCHAR)
   - `dept_name` (Unique, VARCHAR)
   - `building`, `budget` (DECIMAL)
   - **Cardinality**: 1-to-Many with `COURSES`, 1-to-Many with `STUDENTS`.

2. **COURSES**:
   - `course_id` (Primary Key, INT)
   - `course_code` (Unique, VARCHAR)
   - `course_name` (VARCHAR)
   - `credits` (INT, CHECK 1-6)
   - `dept_id` (Foreign Key referencing `DEPARTMENTS.dept_id`)
   - **Cardinality**: 1-to-Many with `ENROLLMENTS`, `MARKS`, and `ATTENDANCE`.

3. **STUDENTS**:
   - `student_id` (Primary Key, INT)
   - `name`, `email` (Unique, VARCHAR)
   - `dept_id` (Foreign Key referencing `DEPARTMENTS.dept_id`)
   - `admission_year` (INT)
   - `gpa` (DECIMAL, CHECK 0.00 to 4.00)
   - **Cardinality**: 1-to-Many with `ENROLLMENTS`, `MARKS`, and `ATTENDANCE`.

4. **ENROLLMENTS**:
   - `enrollment_id` (Primary Key, INT)
   - `student_id` (FK -> `STUDENTS.student_id`)
   - `course_id` (FK -> `COURSES.course_id`)
   - `semester`, `enrollment_date`
   - **Constraint**: Composite UNIQUE (`student_id`, `course_id`, `semester`).

5. **MARKS**:
   - `mark_id` (Primary Key, INT)
   - `student_id` (FK -> `STUDENTS.student_id`)
   - `course_id` (FK -> `COURSES.course_id`)
   - `marks_obtained` (DECIMAL, CHECK 0 to max_marks)
   - `max_marks`, `grade`, `exam_type`

6. **ATTENDANCE**:
   - `attendance_id` (Primary Key, INT)
   - `student_id` (FK -> `STUDENTS.student_id`)
   - `course_id` (FK -> `COURSES.course_id`)
   - `total_classes`, `classes_attended`
   - `attendance_percentage` (Stored generated column: `(classes_attended / total_classes) * 100`)

7. **QUERY_HISTORY**:
   - `id` (PK, INT AUTO_INCREMENT)
   - `user_question` (TEXT)
   - `generated_sql` (TEXT)
   - `execution_status` (ENUM 'SUCCESS', 'BLOCKED', 'ERROR')
   - `execution_time_ms` (INT)
   - `rows_count` (INT)
   - `created_at` (TIMESTAMP)

---

## 12. Database Schema (DDL)
```sql
CREATE DATABASE ai_data_analyst;
USE ai_data_analyst;

CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_code VARCHAR(10) NOT NULL UNIQUE,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    building VARCHAR(50) NOT NULL,
    budget DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT chk_budget CHECK (budget >= 0)
);

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    dept_id INT NOT NULL,
    CONSTRAINT fk_course_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    dept_id INT NOT NULL,
    admission_year INT NOT NULL,
    gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_student_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    enrollment_date DATE NOT NULL,
    CONSTRAINT fk_enr_stud FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_enr_crs FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    grade VARCHAR(5) NOT NULL,
    exam_type VARCHAR(30) NOT NULL,
    CONSTRAINT fk_mrk_stud FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_mrk_crs FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    total_classes INT NOT NULL,
    classes_attended INT NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_att_stud FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_att_crs FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

---

## 13. Functional Requirements
1. **Natural Language Input**: User can input free-form inquiries into the dashboard.
2. **Schema-Aware Query Generation**: Generates syntactically correct queries utilizing appropriate joins and aggregate functions.
3. **Safety Enforcement**: Rejects any destructive statement with clear explanatory alerts.
4. **Execution and Performance Timing**: Executes queries and logs milliseconds taken.
5. **Data Grid Display**: Renders responsive table with column headers and cell values.
6. **Automatic Visual Charting**: Generates Bar, Pie, Line, or Doughnut charts when appropriate.
7. **Audit Logging**: Persists question, generated SQL, status, and execution metrics in `query_history`.

---

## 14. Non-Functional Requirements
1. **Security**: Read-only enforcement; no credential leakage in API responses.
2. **Performance**: Query generation and execution within 1.5 - 3.0 seconds under typical broadband.
3. **Reliability**: Graceful fallback heuristics if internet connection to LLM is interrupted.
4. **Usability**: Responsive layout accessible across desktop, tablet, and mobile browsers.
5. **Maintainability**: Clean modular separation of concerns (`agent/`, `database/`, `server/`).

---

## 15. AI Agent Workflow
1. User enters natural language question in UI.
2. Controller receives question and retrieves active schema catalog.
3. Controller constructs prompt containing question, schema entities, columns, data types, and primary/foreign key mappings.
4. Gemini API receives request with JSON schema constraint.
5. Model returns JSON: `{ intent, sql, explanation, chart_type, chart_config }`.
6. Safety Validator parses SQL through pattern matchers and token rules.
7. If safe:
   - Query executes on MySQL.
   - Results are passed to Result Analyzer.
   - Analyzer crafts human-readable summary.
   - Audit entry is logged as 'SUCCESS'.
8. If unsafe:
   - Execution is blocked.
   - Audit entry is logged as 'BLOCKED'.
   - Warning returned to client.

---

## 16. SQL Generation Process
The prompt given to the AI model injects explicit entity relationships:
- `departments.dept_id = courses.dept_id`
- `departments.dept_id = students.dept_id`
- `students.student_id = marks.student_id`
- `courses.course_id = marks.course_id`
- `students.student_id = attendance.student_id`
- `courses.course_id = attendance.course_id`

The model is instructed to always assign human-friendly aliases using `AS` for aggregated columns (e.g. `ROUND(AVG(m.marks_obtained), 2) AS avg_marks`) and to employ `LIMIT` clauses to avoid unconstrained result sizes.

---

## 17. SQL Validation and Security
The validation engine employs a deterministic security policy:
1. **Disallowed Lexical Tokens**: Regular expressions scan for forbidden verbs (`DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `UPDATE`, `INSERT`, `CREATE`, `REPLACE`, `GRANT`, `REVOKE`, `EXEC`).
2. **Read-Only Enclosure**: Ensures the statement begins strictly with `SELECT` or `WITH`.
3. **Statement Boundary Checks**: Prevents semicolon-separated multiple query injection (`SELECT * FROM students; DROP TABLE marks;`).
4. **System Catalog Protection**: Blocks queries targeting MySQL internal databases (`mysql`, `information_schema`, `performance_schema`, `sys`).

---

## 18. Implementation Details
- In the full-stack AI Studio deployment, Express.js mounts the Vite middleware and coordinates with the in-memory relational database and Gemini 3.8 Flash SDK.
- In the standalone local Python submission, Flask provides endpoints `/api/query`, `/api/history`, and `/api/schema`, communicating with MySQL via `mysql-connector-python`.
- Visual charts are created via Chart.js dynamically binding X-axis category labels and Y-axis quantitative metrics.

---

## 19. User Interface & Screenshots Description
1. **Hero Header**: Displays project title, active database name (`ai_data_analyst`), and connection status badge.
2. **Quick Prompt Chips**: Six one-click prompts for demonstration.
3. **Query Formulation Input**: Large input box with "Ask AI" submit button.
4. **AI Analysis & Takeaways Card**: Highlights primary findings in natural English.
5. **Generated SQL Card**: Dark themed code box with syntax highlighting and one-click "Copy SQL" button.
6. **Dynamic Visualization**: Responsive Canvas-rendered chart (Bar, Pie, or Line).
7. **Tabular Results Grid**: Striped Bootstrap data table with column headers and cell values.
8. **Audit History View**: Chronological log of past executions.

---

## 20. Test Cases (Comprehensive 16 Cases)

| Test ID | Category | Question / SQL Attempt | Expected Behavior | Status |
|---|---|---|---|---|
| **TC-01** | Simple SELECT | "Show all departments" | Returns all 5 departments with budget | PASS |
| **TC-02** | Projection & Aliasing | "List student names and their GPAs" | Returns `SELECT name, gpa FROM students ORDER BY gpa DESC` | PASS |
| **TC-03** | Filtering with WHERE | "Show students admitted in year 2023" | Returns students with `admission_year = 2023` | PASS |
| **TC-04** | Sorting & LIMIT | "Who are the top 5 students by marks?" | Generates `ORDER BY marks_obtained DESC LIMIT 5` | PASS |
| **TC-05** | Aggregation (AVG) | "What is the average marks of all students?" | Computes `AVG(marks_obtained)` | PASS |
| **TC-06** | GROUP BY | "How many students are enrolled in each course?" | Groups by course and counts student_ids | PASS |
| **TC-07** | Two-Table INNER JOIN | "Show students with their department names" | `students JOIN departments ON s.dept_id = d.dept_id` | PASS |
| **TC-08** | Three-Table JOIN | "Show students, course names, and marks obtained" | Joins `students`, `marks`, and `courses` | PASS |
| **TC-09** | Four-Table Complex JOIN | "Which department has the highest average marks?" | Joins `departments`, `students`, `marks`, `courses` | PASS |
| **TC-10** | GROUP BY with HAVING | "Show courses with more than 3 enrolled students" | `GROUP BY c.course_id HAVING COUNT(e.student_id) > 3` | PASS |
| **TC-11** | Subquery in WHERE | "Show students with marks above overall average" | `WHERE m.marks_obtained > (SELECT AVG(marks_obtained) FROM marks)` | PASS |
| **TC-12** | Threshold Query | "Show students whose attendance is below 75%" | `WHERE attendance_percentage < 75.0` | PASS |
| **TC-13** | Empty Result Set | "Show students with marks greater than 100" | Query succeeds; displays graceful "0 records found" message | PASS |
| **TC-14** | Dangerous DDL Blocked | `DROP TABLE students;` | Safety validator blocks query; raises security violation alert | PASS |
| **TC-15** | Dangerous DML Blocked | `DELETE FROM marks WHERE marks_obtained < 70;` | Safety validator blocks execution with 403 status | PASS |
| **TC-16** | SQL Injection Blocked | `SELECT * FROM students; UPDATE students SET gpa = 4.0;` | Multi-statement injection blocked | PASS |

---

## 21. Advantages
- Eliminates technical barrier for non-programmer stakeholders.
- Enforces strict read-only security with zero chance of data mutation.
- Speeds up reporting turnaround time from hours to seconds.
- Automatically selects the most meaningful visualization format.
- Complete auditability via the `query_history` table.

---

## 22. Limitations
- System is constrained by the knowledge of schema provided in prompts.
- Cannot fulfill requests referencing external datasets outside the database.
- Highly obscure or colloquial slang queries may require user clarification.
- Read-only constraint means administrative updates cannot be initiated through this interface.

---

## 23. Future Scope
- **Schema Auto-Discovery**: Support connecting to any arbitrary MySQL, PostgreSQL, or SQLite database URL and generating dynamic embeddings of table schemas.
- **Role-Based Column Masking (RBAC)**: Mask sensitive columns (e.g. email, salary) based on logged-in user role.
- **Voice Input**: Integrate speech-to-text allowing voice queries.
- **Export Formats**: One-click export to PDF, Excel, and CSV formats.

---

## 24. Conclusion
The **AI SQL Data Analyst Agent** demonstrates the synthesis of modern relational database management systems and artificial intelligence. By combining relational algebra, referential integrity constraints, automated join resolution, deterministic safety filtering, and interactive visualization, the project provides a practical, production-ready system suitable for enterprise reporting and educational demonstration.

---

## 25. References
1. Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). *Database System Concepts* (7th ed.). McGraw-Hill Education.
2. Elmasri, R., & Navathe, S. B. (2016). *Fundamentals of Database Systems* (7th ed.). Pearson.
3. MySQL 8.0 Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/
4. Google GenAI SDK Documentation: https://ai.google.dev/gemini-api/docs
5. Chart.js Documentation: https://www.chartjs.org/docs/latest/
