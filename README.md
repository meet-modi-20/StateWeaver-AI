# StateWeaver AI 🧠
### Turning Real Codebases Into Intelligent Coding Challenges

**An AI-powered Behavioural Coding Task Factory for generating realistic, diverse and verifiable software-development challenges.**

<p align="center">
  <b>Innodata Frontier AI Hackathon 2026</b><br>
  Track 1 — Coding Task Factory
</p>

---

## 🚀 Overview

StateWeaver AI is an AI-powered platform designed to transform existing software repositories into realistic coding challenges for evaluating AI coding systems.

Instead of generating simple programming exercises, StateWeaver analyses repository structures, workflows, business rules and state transitions to create meaningful feature-development tasks with edge cases and complex behavioural requirements.

The platform aims to generate reference implementations, functional tests, invariant-based checks and regression tests to validate whether generated solutions satisfy requirements without breaking existing functionality.

**Our goal:** Move beyond testing whether AI can write code and evaluate whether it understands how real software works.

---

## 🎯 Problem Statement

Traditional coding benchmarks often focus on isolated programming problems and straightforward feature implementation.

However, real-world software development involves:

- Complex business logic and interconnected workflows.
- Multiple application states and transitions.
- Edge cases and unexpected user interactions.
- Dependencies between existing components.
- Regression risks when introducing new features.
- Reliable verification of functional requirements.

StateWeaver AI addresses these challenges through repository-aware task generation and behavioural validation.

---

## 💡 Our Solution

StateWeaver AI introduces a reusable pipeline that converts existing software repositories into realistic, independently verifiable coding tasks.

### Core Capabilities

| Module | Description |
|---|---|
| Repository Intelligence | Analyses repository structure, dependencies and codebase information. |
| Behaviour Discovery | Identifies workflows, business rules and state transitions. |
| Intelligent Task Generation | Creates realistic feature-development tasks with meaningful variations. |
| Reference Implementation | Generates a proposed solution compatible with the target repository. |
| Invariant-Based Testing | Checks essential business rules and behavioural constraints. |
| Regression Testing | Verifies that existing functionality remains intact. |
| Mutation Testing | Evaluates whether tests can detect deliberately introduced defects. |
| Task Package Export | Packages requirements, solutions, tests and validation evidence. |

---

## ✨ Key Innovation

### 1. Behavioural Diversity

Generate genuinely different coding challenges by varying:

- Business rules.
- State transitions.
- User interactions.
- Failure conditions.
- Boundary cases.

### 2. Invariant-Driven Verification

Define conditions that must always remain true.

**Examples:**
- A delivered order cannot be cancelled.
- A cancelled order cannot be cancelled twice.
- A refund cannot exceed the amount paid.
- A failed payment must not mark an order as paid.

### 3. Repository-Aware Generation

Generate tasks based on the actual structure, conventions and dependencies of an existing software project rather than producing unrelated generic coding questions.

---

## ⚙️ How It Works

```text
    EXISTING SOFTWARE REPOSITORY
                |
                v
      REPOSITORY ANALYSIS
                |
                v
      BEHAVIOUR DISCOVERY
                |
                v
       TASK GENERATION
                |
                v
    REFERENCE IMPLEMENTATION
                |
                v
       TEST GENERATION
                |
                v
     VALIDATION ENGINE
                |
                v
       TASK PACKAGE
                |
                v
       BENCHMARKING
```

The pipeline is designed to be reusable across different software repositories and technology stacks.

---

## 🧪 Example Use Case

**Scenario: Order Cancellation Feature**

Given an existing order-management application, StateWeaver AI can generate a coding challenge requiring developers to implement order cancellation.

Possible behavioural variations:

1. Cancellation of unpaid orders.
2. Cancellation of paid orders with refund handling.
3. Rejection of cancellation after shipment.
4. Prevention of duplicate cancellation requests.
5. Handling of invalid order-state transitions.

The generated task should include clear requirements, a reference solution and tests covering both new functionality and existing behaviour.

---

## 🏗️ System Architecture

The proposed architecture consists of five major layers:

**1. Input Layer**
- Git repository URL.
- Repository ZIP upload.
- Starting repository version.

**2. Intelligence Layer**
- Repository structure analysis.
- Programming language detection.
- Dependency identification.
- Workflow and business-rule discovery.

**3. Generation Layer**
- Behavioural scenario generation.
- Requirement generation.
- Reference solution generation.
- Test generation.

**4. Validation Layer**
- Functional verification.
- Invariant checking.
- Regression testing.
- Mutation testing.

**5. Output Layer**
- Reusable coding task packages.
- Reference implementations.
- Test suites.
- Validation evidence.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Workflow Visualisation | React Flow |
| Backend | Python, FastAPI |
| AI Integration | Claude API |
| Repository Analysis | Git, GitPython, Tree-sitter |
| Testing | Pytest / Repository-native frameworks |
| Database | SQLite / PostgreSQL |
| Infrastructure | Docker |
| Version Control | Git, GitHub |

*The implementation may adapt to the programming language and execution environment of the supplied repository.*

---

## 📂 Project Structure

```text
StateWeaver-AI/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       └── assets/
│
├── backend/
│   ├── api/
│   ├── repository_analyzer/
│   ├── behaviour_engine/
│   ├── task_generator/
│   ├── reference_generator/
│   ├── test_generator/
│   └── validator/
│
├── sample_tasks/
├── tests/
├── evaluation/
├── docs/
│
├── .env.example
├── .gitignore
└── README.md
```

*Folder structure can be adjusted to match the actual implementation.*

---

## 💻 Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm
- Git
- Docker (if isolated execution is enabled)
- Claude API key (for AI-powered features)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/StateWeaver-AI.git

cd StateWeaver-AI
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables using `.env.example`.

Start the backend (assuming the FastAPI entry point is `main.py`):

```bash
uvicorn main:app --reload
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Open the local development URL displayed by Vite.

*These commands assume the corresponding configuration and entry-point files are present in the project.*

---

## 🔐 Environment Variables

Create a `.env` file inside the backend directory.

```env
ANTHROPIC_API_KEY=your_api_key_here

DATABASE_URL=your_database_url

APP_ENV=development
```

Never commit API keys, passwords or sensitive credentials to GitHub.

---

## 📊 Expected Validation Evidence

StateWeaver AI is designed to demonstrate the reliability of generated coding challenges through:

- Requirement coverage.
- Successful reference implementation tests.
- Detection of missing or incorrect behaviour.
- Regression test results.
- Invariant verification.
- Mutation testing results.
- Reproducible task-package execution.

All reported results should come from actual prototype execution.

---

## 🗺️ Development Roadmap

- [ ] Repository ingestion and analysis.
- [ ] Programming language and dependency detection.
- [ ] Behavioural workflow discovery.
- [ ] Intelligent coding task generation.
- [ ] Reference implementation generation.
- [ ] Invariant-based test generation.
- [ ] Functional and regression validation.
- [ ] Mutation testing integration.
- [ ] Reusable task-package export.
- [ ] Benchmark evaluation and reporting.

---

## 🌍 Potential Impact

StateWeaver AI aims to contribute to better AI coding evaluation by:

- Making coding benchmarks more realistic.
- Increasing meaningful task diversity.
- Improving edge-case verification.
- Strengthening regression safety.
- Supporting reusable benchmark generation.
- Evaluating deeper software-engineering capabilities.

---

## 👥 Team

**Team Name:** [Your Team Name]

**Team Members:**
- Meet Modi — [Role]
- [Member 2] — [Role]
- [Member 3] — [Role]

**Institution:** Uka Tarsadia University, Gujarat, India.

---

## 🏆 Hackathon

Developed for:

**Innodata Frontier AI Hackathon 2026**

Track 1 — Coding Task Factory

---

## 📌 Project Status

🚧 **Prototype Under Development**

This project is being developed as a working prototype. Features, integrations and validation capabilities will be updated as implementation progresses.

---

## 📬 Connect & Explore

- GitHub: [Repository Link]
- Demo Video: [Demo Link]
- Presentation: [PPT Link]

---

<p align="center">
  <b>StateWeaver AI</b><br>
  Don't just test whether AI can write code.<br>
  Test whether it understands how real software works.
</p>
