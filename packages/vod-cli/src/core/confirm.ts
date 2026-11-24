/**
 * Confirmation before a command changes or deletes something.
 */
import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

export interface ConfirmOptions {
  /** Skip the prompt; this is what agents pass once the user agreed. */
  force?: boolean;
  /** Overrides of the streams, for tests. */
  input?: Readable;
  output?: Writable;
}

export class CancelledError extends Error {
  constructor() {
    super('Operation cancelled');
  }
}

function ask(question: string, input: Readable, output: Writable): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createInterface({ input, output });
    rl.question(`${question} [y/N] `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

/** Whether a stream is attached to a terminal. */
function isTerminal(stream: unknown): boolean {
  return (stream as { isTTY?: boolean } | null)?.isTTY === true;
}

/**
 * Resolves when the operation may proceed.
 *
 * @param message What the command will do, e.g. `permanently delete 3 videos`
 * @throws {CancelledError} When the user declined
 * @throws {Error} When there is no terminal to ask on and `--force` was not given
 */
export async function confirmWrite(message: string, options: ConfirmOptions = {}): Promise<void> {
  if (options.force) return;
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stderr;
  const interactive = (options.input !== undefined && options.output !== undefined) || (isTerminal(input) && isTerminal(output));
  if (!interactive) {
    throw new Error(`This command will ${message}. Re-run it with --force to confirm.`);
  }
  const yes = await ask(`About to ${message}. Continue?`, input, output);
  if (!yes) throw new CancelledError();
}
