# Project Source Tree

**Version**: 1.2  
**Last Updated**: 2025-07-01  
**Related**: [Tech Stack](./tech-stack.md), [Coding Standards](./coding-standards.md)

---

## 📁 Project Structure Overview

```
polyv-cli/
├── 📄 package.json                 # npm package configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 .gitignore                  # Git ignore patterns
├── 📄 README.md                   # Project documentation
├── 📄 CLAUDE.md                   # AI agent documentation
│
├── 📁 src/                        # Source code (TypeScript)
│   ├── 📄 index.ts                # CLI entry point
│   ├── 📁 commands/               # Command definitions
│   ├── 📁 handlers/               # Business logic handlers
│   ├── 📁 services/               # External API services
│   ├── 📁 config/                 # Configuration management
│   ├── 📁 types/                  # TypeScript type definitions
│   └── 📁 utils/                  # Utility functions
│
├── 📁 dist/                       # Compiled JavaScript output
│   └── 📄 index.js                # Main executable
│
├── 📁 tests/                      # Test files
│   ├── 📁 unit/                   # Unit tests
│   ├── 📁 integration/            # Integration tests
│   └── 📁 e2e/                    # End-to-end tests
│
├── 📁 docs/                       # Documentation
│   ├── 📁 architecture/           # Architecture documentation
│   ├── 📁 prd/                    # Product requirements
│   ├── 📁 api/                    # API documentation
│   └── 📁 stories/                # User stories
│
├── 📁 coverage/                   # Test coverage reports
├── 📁 node_modules/               # Dependencies (gitignored)
└── 📁 .bmad-core/                 # AI development configuration
    ├── 📄 core-config.yml         # Core configuration
    └── 📁 templates/              # Document templates
```

---

## 🎯 Source Code Organization

### **Entry Point (`src/index.ts`)**

```typescript
#!/usr/bin/env node

/**
 * @fileoverview Main CLI entry point
 * Bootstraps the application, registers commands, and handles global errors
 */

import { Command } from 'commander';
import { registerChannelCommands } from './commands/channel.commands';
import { registerStreamCommands } from './commands/stream.commands';
import { setupGlobalErrorHandling } from './utils/error-handler';

// Global error handling setup
setupGlobalErrorHandling();

// Create main program
const program = new Command();

// Register command modules
registerChannelCommands(program);
registerStreamCommands(program);

// Parse and execute
program.parse();
```

### **Commands Layer (`src/commands/`)**

```
src/commands/
├── 📄 index.ts                    # Command exports
├── 📄 channel.commands.ts         # Channel management commands
├── 📄 stream.commands.ts          # Stream control commands
└── 📄 config.commands.ts          # Configuration commands
```

**Purpose**: Define CLI command structure, options, and argument parsing
**Pattern**: Each command file exports a registration function

```typescript
// Example: channel.commands.ts
export function registerChannelCommands(program: Command): void {
  const channelCmd = program.command('channel');
  
  channelCmd
    .command('create')
    .description('Create a new live streaming channel')
    .option('--name <name>', 'Channel name')
    .option('--scene <scene>', 'Live scene type')
    .action(wrapCommand(channelHandler.create));
}
```

### **Handlers Layer (`src/handlers/`)**

```
src/handlers/
├── 📄 index.ts                    # Handler exports
├── 📄 base.handler.ts             # Abstract base handler
├── 📄 channel.handler.ts          # Channel operations
└── 📄 stream.handler.ts           # Stream operations
```

**Purpose**: Business logic orchestration and input/output handling
**Pattern**: Each handler extends BaseHandler and implements specific operations

```typescript
// Example: channel.handler.ts
export class ChannelHandler extends BaseHandler {
  constructor(private polyvService: PolyVService) {
    super();
  }

  async create(options: ChannelCreateOptions): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      const request = this.validateCreateRequest(options);
      const channel = await this.polyvService.createChannel(request);
      this.displaySuccess('Channel created successfully', channel);
    }, 'channel.create');
  }
}
```

### **Services Layer (`src/services/`)**

```
src/services/
├── 📄 index.ts                    # Service exports
├── 📄 polyv.service.ts            # Main PolyV API client
├── 📄 auth.service.ts             # Authentication handling
└── 📄 http.service.ts             # HTTP client wrapper
```

**Purpose**: External API integration and data transformation
**Pattern**: Service classes with async methods for API operations

```typescript
// Example: polyv.service.ts
export class PolyVService {
  private httpClient: AxiosInstance;
  
  constructor(private config: PolyVConfig) {
    this.httpClient = this.createHttpClient();
  }

  async createChannel(request: ChannelCreateRequest): Promise<ChannelModel> {
    const response = await this.httpClient.post('/live/v4/channel/create', request);
    return this.transformChannelResponse(response.data);
  }
}
```

### **Configuration Layer (`src/config/`)**

```
src/config/
├── 📄 index.ts                    # Configuration exports
├── 📄 loader.ts                   # Config loading logic
├── 📄 manager.ts                  # Config management
├── 📄 validator.ts                # Config validation
└── 📄 auth.ts                     # Authentication config
```

**Purpose**: Configuration management and validation
**Pattern**: Separate concerns for loading, validating, and managing config

### **Types Layer (`src/types/`)**

```
src/types/
├── 📄 index.ts                    # Type exports
├── 📄 config.ts                   # Configuration types
├── 📄 auth.ts                     # Authentication types
└── 📄 signature.ts                # Signature generation types
```

**Purpose**: TypeScript type definitions and interfaces
**Pattern**: Grouped by domain, exported through index.ts

### **Utils Layer (`src/utils/`)**

```
src/utils/
├── 📄 index.ts                    # Utility exports
├── 📄 errors.ts                   # Error classes and handlers
├── 📄 signature.ts                # MD5 signature generation
├── 📄 formatter.ts                # Output formatting
└── 📄 logger.ts                   # Logging utilities
```

**Purpose**: Cross-cutting concerns and helper functions
**Pattern**: Pure functions and utility classes

---

## 🧪 Testing Structure

### **Test Organization**

```
tests/
├── 📁 unit/                       # Unit tests (co-located with source)
│   ├── 📁 handlers/               # Handler unit tests
│   ├── 📁 services/               # Service unit tests
│   └── 📁 utils/                  # Utility unit tests
│
├── 📁 integration/                # Integration tests
│   ├── 📄 api.integration.test.ts # API integration tests
│   └── 📄 auth.integration.test.ts# Auth integration tests
│
├── 📁 e2e/                        # End-to-end tests
│   ├── 📄 cli.e2e.test.ts         # CLI command tests
│   └── 📄 workflow.e2e.test.ts    # Complete workflow tests
│
└── 📁 fixtures/                   # Test data and mocks
    ├── 📄 mock-responses.ts       # API response mocks
    └── 📄 test-data.ts            # Test data sets
```

### **Test Naming Conventions**

```typescript
// Unit tests: {module}.test.ts
src/handlers/channel.handler.test.ts
src/services/polyv.service.test.ts

// Integration tests: {feature}.integration.test.ts
tests/integration/api.integration.test.ts

// E2E tests: {workflow}.e2e.test.ts
tests/e2e/channel-lifecycle.e2e.test.ts
```

---

## 📚 Documentation Structure

### **Architecture Documentation**

```
docs/architecture/
├── 📄 README.md                   # Architecture overview
├── 📄 high-level.md               # High-level design
├── 📄 tech-stack.md               # Technology decisions
├── 📄 data-models.md              # Data models and types
├── 📄 external-apis.md            # API integration specs
├── 📄 error-handling.md           # Error handling strategy
├── 📄 coding-standards.md         # Development standards
└── 📄 source-tree.md              # This document
```

### **Product Requirements**

```
docs/prd/
├── 📄 README.md                   # PRD overview
├── 📄 overview.md                 # Product overview
├── 📄 functional-requirements.md  # Functional specs
├── 📄 non-functional-requirements.md # Non-functional specs
├── 📄 epic-1-foundation.md        # Epic 1 requirements
├── 📄 epic-2-channel-management.md # Epic 2 requirements
└── 📄 epic-3-stream-control.md    # Epic 3 requirements
```

### **API Documentation**

```
docs/api/
└── 📁 channel/                    # PolyV channel APIs
    ├── 📄 create.md               # Channel creation API
    ├── 📄 channels.md             # Channel listing API
    ├── 📄 get_channel_detail.md   # Channel details API
    ├── 📄 update_channel_detail_setting.md # Channel update API
    ├── 📄 batch_delete_channels.md # Batch delete API
    ├── 📄 get_stream_info.md      # Stream info API
    ├── 📄 set_status_start.md     # Start stream API
    └── 📄 set_status_end.md       # End stream API
```

---

## ⚙️ Build and Distribution

### **Build Output**

```
dist/                              # Compiled output
├── 📄 index.js                    # Main executable
├── 📄 index.js.map                # Source map
├── 📁 commands/                   # Compiled commands
├── 📁 handlers/                   # Compiled handlers
├── 📁 services/                   # Compiled services
├── 📁 config/                     # Compiled config
├── 📁 types/                      # Type definitions
└── 📁 utils/                      # Compiled utilities
```

### **Package Files**

```json
{
  "files": [
    "/dist"
  ],
  "main": "dist/index.js",
  "bin": {
    "polyv-cli": "./dist/index.js"
  }
}
```

---

## 🔧 Development Workflow

### **File Creation Patterns**

1. **New Command**: Create in `src/commands/`, register in main command file
2. **New Handler**: Create in `src/handlers/`, extend BaseHandler
3. **New Service**: Create in `src/services/`, implement service interface
4. **New Types**: Define in `src/types/`, export through index.ts
5. **New Utility**: Create in `src/utils/`, add pure functions

### **Import Patterns**

```typescript
// External libraries
import { Command } from 'commander';
import axios from 'axios';

// Internal types
import { ChannelModel, ApiResponse } from '../types';

// Internal services
import { PolyVService } from '../services';

// Internal utilities
import { formatTable, logError } from '../utils';
```

### **Export Patterns**

```typescript
// Named exports preferred
export { ChannelHandler } from './channel.handler';
export { StreamHandler } from './stream.handler';

// Default export for main classes
export default class PolyVService {
  // Implementation
}

// Re-exports through index.ts
export * from './channel.handler';
export * from './stream.handler';
```

---

## 📝 File Naming Conventions

### **Source Files**
- **Commands**: `{domain}.commands.ts` (e.g., `channel.commands.ts`)
- **Handlers**: `{domain}.handler.ts` (e.g., `channel.handler.ts`)
- **Services**: `{domain}.service.ts` (e.g., `polyv.service.ts`)
- **Types**: `{domain}.types.ts` (e.g., `channel.types.ts`)
- **Utils**: `{function}.util.ts` (e.g., `signature.util.ts`)

### **Test Files**
- **Unit Tests**: `{module}.test.ts`
- **Integration Tests**: `{feature}.integration.test.ts`
- **E2E Tests**: `{workflow}.e2e.test.ts`

### **Documentation**
- **Architecture**: `{topic}.md` (kebab-case)
- **API Docs**: `{endpoint}.md` (snake_case to match API)
- **Stories**: `{epic}.{story}.story.md`

---

## 🚀 Getting Started

### **Development Setup**

```bash
# Clone and setup
git clone <repository>
cd polyv-cli
npm install

# Development
npm run dev          # Run in development mode
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Lint code
npm run format       # Format code
```

### **Adding New Features**

1. **Define Types** in `src/types/`
2. **Create Service Methods** in `src/services/`
3. **Implement Handler Logic** in `src/handlers/`
4. **Add CLI Commands** in `src/commands/`
5. **Write Tests** in appropriate test directories
6. **Update Documentation** as needed

---

*This source tree documentation provides a complete guide to the project structure and development patterns. Follow these conventions for consistent, maintainable code.* 