// Silence console output from the code under test; tests read the context's captured output.
if (!process.env.JEST_VERBOSE) {
  global.console = { ...console, log: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
}
