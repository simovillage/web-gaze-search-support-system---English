import { execAsync } from '@src/main/libs/childProcess';

export const execPythonScript = async <T>(
  scriptPath: string,
  args: string[],
) => {
  const result = await execAsync('.venv/Scripts/python.exe', [
    scriptPath,
    ...args,
  ]);

  if (!result.ok) {
    throw result.error;
  }

  if (result.value.stderr) {
    throw new Error(result.value.stderr);
  }

  const { stdout } = result.value;

  let parsedStdout: T;
  try {
    parsedStdout = JSON.parse(stdout);
  } catch {
    parsedStdout = stdout as unknown as T;
  }

  return parsedStdout;
};
