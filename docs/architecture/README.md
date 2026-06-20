# PolyV Live Streaming CLI Tool - Architecture Documentation

**Version**: 1.2 (Sharded Architecture)  
**Created**: 2025-07-01  
**Architect**: Winston

---

## 📋 Overview

This directory contains the comprehensive architecture documentation for the PolyV Live Streaming CLI Tool (保利威直播云CLI工具), organized into specialized modules for efficient reference and maintenance.

The architecture follows a **layered pattern** with TypeScript/Node.js, emphasizing simplicity, rapid iteration, and extensibility while ensuring robust PolyV API integration.

---

## 🗂️ Document Structure

### 🎯 [High-Level Architecture (high-level.md)](./high-level.md)
- Technical summary and architectural decisions
- System diagrams and component interactions
- Architectural patterns and design principles
- High-level user flows

### 🛠️ [Technology Stack (tech-stack.md)](./tech-stack.md)
- Complete technology selection with versions
- Rationale for each technology choice
- Cloud infrastructure decisions
- Development tooling specifications

### 📊 [Data Models (data-models.md)](./data-models.md)
- ChannelModel, AuthenticationModel, ApiResponseModel
- StreamInfoModel, ChannelListModel
- Relationships and data flow patterns
- PolyV API response structures

### 🌐 [External APIs (external-apis.md)](./external-apis.md)
- PolyV OpenAPI integration specifications
- Endpoint details and authentication
- API versioning (v2/v3/v4) handling
- Integration patterns and constraints

### ⚠️ [Error Handling (error-handling.md)](./error-handling.md)
- Error model and exception hierarchy
- PolyV API error mapping
- Logging standards and patterns
- User-friendly error messages

### 📏 [Coding Standards (coding-standards.md)](./coding-standards.md)
- TypeScript conventions and rules
- Naming conventions
- Critical development guidelines
- AI agent requirements

### 📁 [Project Source Tree (source-tree.md)](./source-tree.md)
- Complete project structure overview
- Source code organization patterns
- File naming conventions
- Development workflow guidelines

### 🔄 [Setup Scene Workflow Specification (setup-scene-workflow-spec.md)](./setup-scene-workflow-spec.md)
- Safety and output contract for `setup <scene>` workflow commands
- Scene DSL v2 proposal, parameterization, and rollback semantics
- Implementation phases and test plan for future built-in scenes

---

## 📋 **Future Documentation (To Be Created)**

The following documents are planned for future implementation:

### 🧩 Components & Services
- CLI entry point and command layer
- Handler and service layer architecture
- Utility layer design
- Component interaction diagrams

### 🔄 Core Workflows
- Channel creation and management flows
- Stream control operations
- Authentication and error handling
- Sequence diagrams for key operations

### 🗃️ Project Structure
- Source tree organization
- File and directory conventions
- Build and distribution structure
- Testing organization

### 🚀 Infrastructure & Deployment
- CI/CD pipeline configuration
- npm distribution strategy
- Environment management
- Rollback procedures

### 🧪 Testing Strategy
- Test pyramid and coverage goals
- Unit, integration, and E2E testing
- Test data management
- Continuous testing practices

### 🔒 Security Guidelines
- Authentication and authorization
- Secrets management
- Input validation requirements
- Security testing approach

---

## 🎯 Architecture Goals

### **Core Principles**
- **Simplicity**: Mature, maintainable technology choices
- **Rapid Iteration**: Team expertise-driven development
- **Extensibility**: Easy addition of new commands and features
- **Fault Tolerance**: Graceful API failure handling

### **Key Decisions**
- **TypeScript 5.3.3**: Type safety and maintainability
- **Node.js 20.11.0 LTS**: Stable runtime with rich ecosystem
- **Commander.js 11.1.0**: Battle-tested CLI framework
- **Layered Architecture**: Clear separation of concerns
- **MD5 Signature Auth**: PolyV API requirement compliance

---

## 🚀 Quick Start for Developers

### **Implementation Priority**
1. **Epic 1.1**: Project setup and basic CLI structure
2. **Authentication**: MD5 signature implementation
3. **Channel Management**: Core CRUD operations
4. **Stream Control**: Live streaming operations
5. **Error Handling**: Robust error management

### **Key Reference Documents**
- **Technical Decisions**: [tech-stack.md](./tech-stack.md)
- **API Integration**: [external-apis.md](./external-apis.md)
- **Development Rules**: [coding-standards.md](./coding-standards.md)
- **Project Structure**: [source-tree.md](./source-tree.md)
- **Error Handling**: [error-handling.md](./error-handling.md)

### **Development Commands**
```bash
# Setup project
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

---

## 🔗 Related Documentation

- **[Product Requirements](../prd.md)**: Functional specifications
- **[User Stories](../stories/)**: Implementation tasks
- **[API Reference Indexes](../api-reference/)**: Project indexes for PolyV API docs; raw docs live under `../document-center/docs/live/api` relative to the repository root
- **[Main Architecture](../architecture.md)**: Complete unified document

---

## 📝 Document Maintenance

### **Update Process**
1. Modify relevant sharded documents
2. Update version numbers and change logs
3. Sync changes with main architecture document
4. Validate cross-references between documents

### **Version Control**
- Each document maintains its own version history
- Major architectural changes increment all document versions
- Cross-document dependencies are clearly marked

---

## 🤝 Team Usage

### **For AI Agents**
- Reference [coding-standards.md](./coding-standards.md) for development rules
- Use [data-models.md](./data-models.md) for type definitions
- Follow [source-tree.md](./source-tree.md) for project structure
- Follow [error-handling.md](./error-handling.md) for exception patterns

### **For Human Developers**
- Start with [high-level.md](./high-level.md) for system understanding
- Reference [external-apis.md](./external-apis.md) for API integration
- Follow [error-handling.md](./error-handling.md) for robust error management

### **For DevOps**
- Reference [tech-stack.md](./tech-stack.md) for deployment requirements
- Use future infrastructure documentation for deployment setup
- Follow [coding-standards.md](./coding-standards.md) for quality standards

---

*Architecture documentation complete and ready for implementation. Each module provides focused, actionable guidance for specific aspects of the system.*
