# DAC Study Chatbot - Software Architecture Document

**Version:** 2.0
**Date:** November 24, 2025
**Status:** Prototype Phase
**Audience:** Clinical Trial Researchers, Protocol Reviewers, Study Research Leads

---

## Executive Summary

The DAC Study Chatbot is an AI-powered conversational interface designed to accelerate protocol review and study analysis through intelligent document retrieval and contextual assistance. Built for clinical trial researchers, the system enables semantic search across protocol documents, real-time collaborative review sessions, and AI-assisted analysis of study designs.

**Current Status:** Fully functional prototype with real-time messaging, chain-of-thought reasoning display, user authentication, and RAG-powered document retrieval.

**Key Users:**
- Clinical Operations Teams
- Statistical Review Teams
- Implementation Science Teams
- Study Research Leads (SRL)
- Protocol Reviewers

**Technical Overview:** Modern web stack with visual workflow automation (N8N), enabling non-technical stakeholders to modify AI agent behavior without engineering resources. Self-hosted database ensures protocol confidentiality and regulatory compliance (HIPAA, GDPR, SOC 2).

---

## 1. Current Prototype Stack

### Technology Stack Overview

![DAC Chatbot System Architecture](pdfs/assets/dac-chatbot-main.png)

### Frontend Stack

**React 19.2.0** - Modern UI library for building responsive research interfaces
- Component-based architecture enables rapid iteration on protocol review workflows
- TypeScript provides type safety and reliable code structure
- Real-time updates for collaborative protocol review sessions

**Vite 7.2.2** - Next-generation build tool with sub-second hot module replacement
- Enables fast development cycles for researcher-facing features
- Production builds optimized for global CDN delivery

**Tailwind CSS 4.1.17** - Utility-first CSS framework
- Consistent design system for complex data visualization
- Responsive layouts for desktop and mobile protocol review

**Framer Motion 12.23.24** - Animation library for UI transitions
- Smooth chain-of-thought reasoning display
- Polished interactions for professional research environments

**marked 17.0.0** - Markdown rendering for AI responses
- Protocol citations and document references formatted cleanly
- Custom link handling with security attributes

### Backend Infrastructure

**Supabase (Self-Hosted)** - PostgreSQL database with enterprise features
- **PostgreSQL 15** with pgvector extension for semantic search
- **Row Level Security (RLS)** ensures protocol isolation between competing studies
- **Real-time subscriptions** via WebSocket for collaborative review sessions
- **Built-in authentication** with invite-only access for research teams
- **Self-hosted on organization infrastructure** for complete data sovereignty (HIPAA/GDPR compliance)

**N8N Workflow Engine** - Visual automation platform for AI orchestration
- **Hosted workflow:** Cloud-managed execution environment
- **Langchain integration** with AI Agent node for multi-step reasoning
- **PostgreSQL chat memory** scoped to individual research sessions
- **Custom tool framework** enables organization-specific capabilities (database queries, API integrations)
- **Visual workflow editor** allows non-engineers to modify agent behavior without code deployment

**Azure OpenAI** - Enterprise AI model access
- **Model:** gpt-4 (configured via N8N credentials)
- **Max iterations:** 30 for complex protocol analysis
- **Streaming enabled** for real-time response rendering
- **Enterprise compliance:** SOC 2, HIPAA-ready deployments

### Vector Database & RAG

**Supabase pgvector** - Embedded vector storage for semantic search
- **OpenAI text-embedding-ada-002** (1536 dimensions)
- **Documents table** with similarity search for protocol retrieval
- **Static content table** for full document access
- **Integrated with N8N** for retrieval-augmented generation (RAG)

**Use Case:** Researchers ask "Find all diabetes trials with adaptive designs" and the system semantically retrieves relevant protocols without exact keyword matching.

### Deployment & Hosting

**Frontend Hosting** - Global CDN for fast access by distributed research teams
- Content delivery network for optimized performance
- Automatic HTTPS and secure deployments

**CDN Layer** - Traffic routing and caching for optimized delivery

**N8N Cloud** - Managed workflow execution environment

**Self-Hosted Supabase** - Database and authentication on organization-controlled servers for regulatory compliance

---

## 2. System Architecture

### 2.1 Database Schema

![Database Schema](pdfs/assets/database-schema.png)

**Core Entities:**
- **sessions** - User chat sessions with auto-generated titles for protocol review conversations
- **messages** - Individual messages with role (user/agent) and finality flag (interim thoughts vs final responses)
- **documents** - Vector embeddings for semantic search across protocol libraries
- **static_content** - Full document storage for citation and retrieval

**Security Design:**

**Row Level Security (RLS)** - Critical for clinical trial confidentiality
- Policies enforce user_id matching for all queries
- Competing study teams cannot access each other's protocol review sessions
- Audit logs track all data access for regulatory compliance

**Additional Features:**
- Cascade deletes: Removing a session deletes all associated messages
- JSONB metadata: Flexible schema for future protocol attributes
- Timestamp tracking: created_at and updated_at for audit trails
- Boolean `final` flag: Distinguishes AI reasoning steps from final responses

### 2.2 Message Flow & Real-Time Subscription

![Message Flow Diagram](pdfs/assets/group2a-message-flow.png)

**Real-Time Collaboration:**

The frontend maintains an active WebSocket connection to Supabase Realtime, listening for INSERT events on the messages table filtered by session_id.

![Real-Time Subscription Code](pdfs/assets/frontend-code.png)

This enables instant message rendering without polling, supporting collaborative protocol review sessions where multiple researchers can see AI reasoning steps in real-time before the final response appears.

**Use Case:** During a live protocol review meeting, team members can simultaneously watch the AI agent's chain-of-thought analysis of study endpoints, statistical methods, and regulatory compliance issues.

### 2.3 Frontend Architecture

![Component Hierarchy](pdfs/assets/group2b-component-hierarchy.png)

**Key Features for Researchers:**

**1. Chain-of-Thought Display**
Messages with `final: false` are visually distinct, showing the agent's reasoning process:
- Amber-themed cards for interim analysis steps
- White background for final responses
- Grouped by reasoning flow for protocol review clarity

**2. Responsive Design**
- Desktop: Fixed sidebar (320px width) for session navigation
- Mobile: Full-screen drawer for field research environments
- Keyboard shortcut: CMD+N / CTRL+N for new protocol review chat
- Auto-scroll to latest message during active analysis

**3. Authentication Flow**
- Invite-only access via Supabase Auth (email/password)
- Protected routes ensure only authorized researchers access protocols
- Persistent sessions for multi-day protocol review workflows

**4. Markdown Rendering**
- AI responses formatted with headers, lists, code blocks
- Protocol citations rendered as clickable links (target="_blank")
- Security attributes (rel="noopener noreferrer") for external references

### 2.4 N8N Workflow Architecture

![N8N Workflow Architecture](pdfs/assets/group1b-n8n-workflow.png)

**Why N8N for Clinical Trial Research:**

1. **Non-Technical Workflow Modification** - Protocol reviewers can understand and modify agent behavior through visual workflows without waiting for engineering resources

2. **Langchain Integration Without Code** - Pre-built nodes for RAG, multi-step reasoning, and tool calling eliminate hundreds of lines of custom Python code

3. **Organization-Specific Tools** - Create custom capabilities visually:
   - Query internal clinical trial databases
   - Call regulatory submission APIs
   - Execute statistical validation logic
   - Integrate with protocol management systems

**Current Workflow:** Visual workflow configuration

**Custom Tools Available:**

![N8N Custom Tools](pdfs/assets/n8n-tools.png)

- **user_msg** - Insert interim reasoning steps for chain-of-thought display
- **get_document** - Retrieve full protocol documents by ID
- **vector_kb** - Semantic search via pgvector for protocol sections

### 2.5 Vector Search Implementation

![Vector Search Query](pdfs/assets/vector-search.png)

**RAG (Retrieval-Augmented Generation) for Protocol Review:**

Researchers ask natural language questions like:
- "What adaptive designs were used in recent diabetes trials?"
- "Find protocols with interim analysis stopping rules"
- "Show me sample size calculations for equivalence studies"

The system:
1. Converts question to 1536-dimension vector (OpenAI embeddings)
2. Searches `documents` table using cosine similarity
3. Retrieves top-k most relevant protocol sections
4. Provides context to AI agent for accurate, cited responses

**Current Limitations:**
- pgvector performance degrades beyond 100K vectors
- Limited metadata filtering (no "protocols from 2023 with diabetes focus")
- Fixed embedding dimensions (OpenAI's text-embedding-ada-002 model)

**Production Solution:** Migrate to Qdrant vector database (see Section 3.2)

### 2.6 Authentication & Authorization

**Current Implementation: Supabase Auth**

**Security Model:**
- Invite-only email/password authentication (no public signup)
- JWT tokens for API authentication
- Row Level Security (RLS) policies enforce user_id matching
- Persistent sessions via localStorage for multi-day workflows

**Compliance Features:**
- Audit logs for all authentication events
- Password reset and email verification workflows
- Session timeouts for inactive researchers
- Multi-factor authentication ready (Supabase supports TOTP)

---

## 3. Production Migration Plan

### Migration Strategy Overview

The current prototype architecture is production-ready for small research teams (5-10 users). For enterprise deployment with 100+ researchers across multiple clinical trials, these enhancements provide:

1. **Data Sovereignty** - Complete control over protocol data location and access
2. **Performance at Scale** - 10x faster queries with purpose-built databases
3. **Enterprise Compliance** - HIPAA, GDPR, SOC 2 certifications
4. **Cost Optimization** - Self-hosted infrastructure without per-seat licensing

### Phase 1: Database Self-Hosting ✅ COMPLETED

**Status:** Already implemented - Supabase is self-hosted on organization-controlled infrastructure

**What We Have:**
- Self-hosted PostgreSQL 15 with pgvector extension
- Row Level Security (RLS) for protocol isolation
- Real-time subscriptions for collaborative sessions
- Complete backup and disaster recovery control

**Why This Matters for Clinical Trials:**
- Protocol data never leaves organization servers
- HIPAA compliance for patient data in protocols
- GDPR compliance for international multi-site trials
- SOC 2 audit trail for regulatory submissions
- No third-party vendor access to proprietary study designs

**Next Step:** Consider Phase 2 (Qdrant) when protocol library exceeds 100K documents

### Phase 2: Qdrant Vector Database

**Current:** pgvector embedded in PostgreSQL (works well for <100K vectors)
**Upgrade:** Qdrant self-hosted on VPS or Azure Container Instance

**Why Qdrant for Large Protocol Libraries:**

1. **10x Performance** - Purpose-built for vector search at scale (>100K protocols)
2. **Metadata Filtering** - "Find Phase 3 diabetes trials from 2023" (combine semantic + structured search)
3. **Hybrid Search** - Merge keyword search (BM25) with semantic search for better protocol retrieval
4. **Horizontal Scaling** - Shard protocol collections across multiple nodes as library grows

**Implementation Timeline:** 1-2 weeks

**Use Case:** Research organization with 500K+ protocol documents across decades of clinical trials requires sub-50ms semantic search.

### Phase 3: Redis Caching Layer

**Current:** Direct PostgreSQL queries for every message load
**Upgrade:** Redis cache for sessions, messages, and frequently accessed protocols

**Why Redis for Active Research Sessions:**

1. **Session Caching** - Sub-millisecond access to active protocol review conversations
2. **Rate Limiting** - Prevent API abuse during high-usage periods (conference presentations, training sessions)
3. **Real-Time Pub/Sub** - Replace Supabase Realtime with Redis channels for collaborative sessions
4. **Cost Reduction** - Offload 80% of reads from PostgreSQL

**Implementation Timeline:** 2-3 weeks

**Use Case:** During live protocol review meeting with 50 researchers, Redis ensures instant message delivery without database bottlenecks.

### Phase 4: Organization-Owned Azure OpenAI

**Current:** Azure OpenAI accessed via N8N credentials (shared/multi-tenant)
**Upgrade:** Organization-owned Azure OpenAI instance with dedicated deployment

**Why Org-Owned OpenAI for Clinical Trials:**

1. **Data Privacy Contract** - Microsoft guarantees protocol conversations do NOT train public models
2. **HIPAA Compliance** - Business Associate Agreement (BAA) for patient data in protocols
3. **Content Filtering** - Built-in moderation for safety compliance
4. **Private Endpoints** - No public internet exposure for protocol analysis
5. **SLA Guarantees** - Enterprise support and 99.9% uptime for critical research deadlines

**Implementation Timeline:** 1 day

**Use Case:** Pharmaceutical company requires contractual guarantee that proprietary drug trial protocols are never used to train public AI models.

### Phase 5: Microsoft 365 Integration (Optional)

**When to Implement:** If organization uses Microsoft 365 for research operations

**Integration Opportunities:**
- **Microsoft Entra ID** - Single Sign-On with existing org credentials
- **Teams Bot** - Notifications for protocol review completions
- **SharePoint** - Access to regulatory submission templates and SOPs

**Note:** These integrations are optional enhancements. Consult with IT team to determine organizational requirements.

**Implementation Timeline:** 3-4 weeks (if required)

---

## 4. Implementation Roadmap

### Timeline Overview

**Phase 1: Database Self-Hosting** ✅ COMPLETED
- Status: Self-hosted Supabase operational with full RLS implementation
- Success Criteria: All protocol data on organization servers, HIPAA compliance verified

**Phase 2: Qdrant Vector Database** (Weeks 1-2)
- Deploy Qdrant via Docker
- Migrate protocol embeddings from pgvector
- Benchmark: Vector search <50ms for 1M protocols

**Phase 3: Redis Caching** (Weeks 3-4)
- Deploy Redis instance
- Implement session and message caching
- Success Criteria: 80% cache hit rate, <1ms cache access

**Phase 4: Azure OpenAI** (Week 5)
- Create organization-owned Azure OpenAI resource
- Update N8N workflow credentials
- Verify HIPAA compliance and BAA

**Phase 5: Microsoft Integration** (Weeks 6-8, if required)
- Implement Microsoft Entra ID SSO
- Add Teams bot for notifications (optional)
- Enable SharePoint document access (optional)

---

## 5. Appendices

### A. Key Components

**Frontend Components:**
- React application with TypeScript for type safety
- Real-time chat interface with authentication
- Message display with chain-of-thought reasoning
- N8N webhook integration for AI processing

**Backend Configuration:**
- N8N workflow for AI orchestration
- Database schema with Row Level Security
- User authentication and session management

### B. Database Implementation

**Implementation:**
- Automated schema creation with Row Level Security
- User authentication and data isolation policies
- Real-time subscriptions for collaborative sessions

![Migration Scripts](pdfs/assets/infrastructure.png)

### C. N8N Workflow Management

**Implementation:**
- Visual workflow design exportable for version control
- Non-technical staff can modify agent behavior through UI
- Workflow changes can be backed up and versioned

### D. Key Diagrams

This document references 8 architecture diagrams:

1. **DAC Chatbot Main System** - Overall architecture overview
2. **Database Schema** - Tables, relationships, RLS policies
3. **Message Flow** - End-to-end pipeline from user input to AI response
4. **Frontend Code** - Real-time subscription implementation
5. **Component Hierarchy** - React component structure
6. **N8N Workflow** - 4-step AI agent processing flow
7. **N8N Custom Tools** - Available agent capabilities
8. **Vector Search** - RAG implementation for semantic protocol retrieval

---

## Glossary

**RAG (Retrieval-Augmented Generation)** - AI technique that cites sources by retrieving relevant documents before generating responses. Enables accurate, verifiable answers to protocol questions.

**RLS (Row Level Security)** - PostgreSQL security feature that enforces data isolation at the database level. Ensures competing study teams cannot access each other's protocol review sessions.

**pgvector** - PostgreSQL extension for storing and searching vector embeddings. Enables semantic search ("Find similar protocols") without exact keyword matching.

**N8N** - Open-source workflow automation platform with visual editor. Enables non-technical researchers to modify AI agent behavior without code deployment.

**HNSW (Hierarchical Navigable Small World)** - Graph-based algorithm for fast approximate nearest neighbor search in high-dimensional vector spaces. Used by Qdrant for efficient protocol retrieval.

**WebSocket** - Communication protocol for real-time bidirectional data transfer. Enables instant message delivery during collaborative protocol review sessions.

---

**Document Version:** 2.0
**Last Updated:** November 24, 2025
**Next Review:** Q1 2026
