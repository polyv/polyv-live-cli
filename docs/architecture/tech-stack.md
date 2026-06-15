# Technology Stack

**Version**: 1.2  
**Last Updated**: 2025-07-01  
**Related**: [High-Level Architecture](./high-level.md)

---

## Cloud Infrastructure

- **Provider:** Not applicable (CLI tool runs locally)
- **Key Services:** PolyV OpenAPI (external service)
- **Deployment Regions:** Global distribution via npm registry

---

## Core Technology Stack

### **Primary Technologies**

| Category           | Technology         | Version     | Purpose     | Rationale      |
| :----------------- | :----------------- | :---------- | :---------- | :------------- |
| **Language**       | TypeScript         | 5.3.3       | Primary development language | Strong typing, excellent tooling, team expertise, better maintainability |
| **Runtime**        | Node.js            | 20.11.0 LTS | JavaScript runtime | LTS stability, wide ecosystem, async I/O perfect for CLI operations |
| **CLI Framework**  | Commander.js       | 11.1.0      | Command parsing and routing | Most stable and popular CLI framework, simple API, comprehensive features |
| **HTTP Client**    | Axios              | 1.6.0       | PolyV API communication | Feature-rich, Promise-based, built-in interceptors for auth and errors |
| **Configuration**  | dotenv             | 16.3.1      | Environment variable loading | Standard for Node.js env var management |
| **Table Output**   | cli-table3         | 0.6.3       | Formatted console output | Rich text table formatting with customizable styles |

### **Development Tools**

| Category           | Technology         | Version     | Purpose     | Rationale      |
| :----------------- | :----------------- | :---------- | :---------- | :------------- |
| **Testing**        | Jest               | 29.7.0      | Unit and integration testing | Comprehensive testing framework with TypeScript support |
| **Build Tool**     | TypeScript Compiler| 5.3.3      | Source compilation | Native TypeScript compilation, no additional bundling needed |
| **Package Manager**| npm                | 10.2.0      | Dependency and distribution | Standard Node.js package manager, global CLI installation support |
| **Linting**        | ESLint             | 8.55.0      | Code quality and style | Industry standard linting with TypeScript support |
| **Formatting**     | Prettier           | 3.1.0       | Code formatting | Consistent code style across team |

---

## Technology Selection Rationale

### **TypeScript 5.3.3**

**Why Chosen:**
- **Type Safety**: Prevents runtime errors through compile-time checking
- **Developer Experience**: Excellent IDE support with IntelliSense and refactoring
- **Team Expertise**: Existing team knowledge and preference
- **Maintainability**: Self-documenting code with clear interfaces
- **Ecosystem**: Rich type definitions for all dependencies

**Alternatives Considered:**
- **JavaScript**: Rejected due to lack of type safety for API integration
- **Go**: Rejected due to team expertise and Node.js ecosystem advantages
- **Python**: Rejected due to deployment complexity and team preference

### **Node.js 20.11.0 LTS**

**Why Chosen:**
- **LTS Stability**: Long-term support ensures stable foundation
- **Async I/O**: Perfect for CLI tools with API calls
- **Rich Ecosystem**: Vast npm package library
- **Cross-Platform**: Runs on Linux, macOS, and Windows
- **Performance**: V8 engine provides excellent performance for CLI operations

**Configuration:**
```json
{
  "engines": {
    "node": ">=20.11.0",
    "npm": ">=10.2.0"
  }
}
```

### **Commander.js 11.1.0**

**Why Chosen:**
- **Battle-Tested**: Most popular CLI framework with proven track record
- **Feature Complete**: Supports all required CLI patterns (commands, options, help)
- **TypeScript Support**: Excellent type definitions and integration
- **Documentation**: Comprehensive docs and community support
- **Minimal Learning Curve**: Simple API that team can adopt quickly

**Key Features Used:**
- Command registration and routing
- Option and argument parsing
- Automatic help generation
- Subcommand support
- Global options handling

### **Axios 1.6.0**

**Why Chosen:**
- **Request/Response Interceptors**: Perfect for MD5 signature injection
- **Error Handling**: Built-in error transformation and retry logic
- **TypeScript Support**: Excellent type definitions
- **Feature Rich**: Timeout, retries, request/response transformation
- **Proven Reliability**: Industry standard for HTTP clients

**Configuration Example:**
```typescript
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for signature
apiClient.interceptors.request.use(injectSignature);

// Response interceptor for error handling
apiClient.interceptors.response.use(null, handleApiError);
```

### **Jest 29.7.0**

**Why Chosen:**
- **Zero Configuration**: Works out of the box with TypeScript
- **Comprehensive**: Unit, integration, and snapshot testing
- **Mocking**: Powerful mocking capabilities for API testing
- **Coverage**: Built-in code coverage reporting
- **TypeScript Integration**: Seamless TypeScript support

**Test Structure:**
```
tests/
├── unit/           # Unit tests co-located with source
├── integration/    # API integration tests
└── e2e/           # End-to-end CLI tests
```

---

## Dependency Management

### **Production Dependencies**

```json
{
  "dependencies": {
    "commander": "^11.1.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "cli-table3": "^0.6.3"
  }
}
```

### **Development Dependencies**

```json
{
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "prettier": "^3.1.0"
  }
}
```

### **Dependency Security**

- **npm audit**: Automated vulnerability scanning
- **Dependabot**: Automated dependency updates
- **Lock Files**: package-lock.json for reproducible builds
- **Version Pinning**: Exact versions for critical dependencies

---

## Build and Development Tools

### **TypeScript Configuration**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### **ESLint Configuration**

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### **Prettier Configuration**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## Package Configuration

### **CLI Distribution Setup**

```json
{
  "name": "polyv-live-cli",
  "version": "1.0.0",
  "description": "CLI tool for managing PolyV live streaming services",
  "main": "dist/index.js",
  "bin": {
    "polyv-cli": "./dist/index.js"
  },
  "files": [
    "/dist"
  ],
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "prepare": "npm run build"
  },
  "keywords": [
    "polyv",
    "live-streaming",
    "cli",
    "typescript"
  ],
  "engines": {
    "node": ">=20.11.0",
    "npm": ">=10.2.0"
  }
}
```

---

## Environment and Runtime

### **Node.js Runtime Requirements**

- **Version**: 20.11.0 LTS (minimum)
- **Features Used**: ES2022, async/await, crypto module
- **Memory**: ~50MB typical usage
- **Startup Time**: <500ms cold start

### **Operating System Support**

| OS | Version | Status |
|----|---------|--------|
| **Linux** | Ubuntu 20.04+ | ✅ Primary |
| **macOS** | 12.0+ | ✅ Primary |
| **Windows** | 10+ | ✅ Secondary |

### **Environment Variables**

```bash
# Required for PolyV API
POLYV_APP_ID=your_app_id
POLYV_APP_SECRET=your_app_secret
POLYV_USER_ID=your_user_id  # Optional

# Development
NODE_ENV=development|production
LOG_LEVEL=debug|info|warn|error
```

---

## Performance Characteristics

### **Bundle Size**
- **Compiled Output**: ~2MB (including dependencies)
- **Install Size**: ~15MB (with node_modules)
- **Startup Time**: <500ms on modern hardware

### **Memory Usage**
- **Base Memory**: ~30MB
- **Peak Memory**: ~50MB during API operations
- **Memory Leaks**: Prevented through proper async/await patterns

### **Network Performance**
- **API Request Timeout**: 30 seconds
- **Retry Logic**: 3 attempts with exponential backoff
- **Concurrent Requests**: Limited to 1 (CLI nature)

---

## Future Technology Considerations

### **Potential Upgrades**

| Technology | Current | Target | Timeline | Reason |
|------------|---------|--------|----------|--------|
| Node.js | 20.11.0 | 22.x LTS | Q2 2025 | Performance improvements |
| TypeScript | 5.3.3 | 5.5.x | Q1 2025 | New language features |
| Jest | 29.7.0 | 30.x | Q2 2025 | Better ESM support |

### **Technology Monitoring**

- **Node.js**: Track LTS releases and security updates
- **Dependencies**: Monitor for security vulnerabilities
- **TypeScript**: Evaluate new features for development productivity
- **CLI Frameworks**: Watch for Commander.js alternatives and improvements

---

*This technology stack provides a solid foundation for rapid development while ensuring long-term maintainability and team productivity.* 