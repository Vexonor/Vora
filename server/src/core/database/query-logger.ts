import * as fs from 'fs';
import moment from 'moment';
import * as path from 'path';

const QUERY_LOG_PATH = path.join(process.cwd(), 'logs', 'query.log');
const EXECUTING_PREFIX_PATTERN = /Executing \([^)]+\):/g;

export const logMutationQuery = (sql: string, options?: unknown) => {
  if ((options as { type?: string } | undefined)?.type === 'SELECT') return;

  fs.mkdirSync(path.dirname(QUERY_LOG_PATH), { recursive: true });
  const timestamp = moment().format('Y-MM-DD-HH-mm-ss:');
  const entry = `${sql.replace(EXECUTING_PREFIX_PATTERN, timestamp)},\n`;

  fs.appendFile(QUERY_LOG_PATH, entry, (error) => {
    if (error) console.error('Failed to write query log:', error);
  });
};
