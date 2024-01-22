import { REQUIRED_PYTHON_VERSION } from '@main/constants';
import { execAsync } from '@main/libs/childProcess';
import semver from 'semver';

export const initialize = async () => {
  console.log('Initializing Python...');

  console.log('Checking Python version...');
  const pyVersionResult = await execAsync<string>('python', ['--version']);
  if (!pyVersionResult.ok) {
    throw new Error(`Python not found: ${pyVersionResult.error.message}`);
  }

  const pyVersion = semver.valid(semver.coerce(pyVersionResult.value.stdout));
  if (!pyVersion) {
    throw new Error(
      `Python version not found: ${pyVersionResult.value.stdout}`,
    );
  }

  if (!semver.gte(pyVersion, REQUIRED_PYTHON_VERSION)) {
    throw new Error(
      `Python version ${pyVersion} is not supported, please install python ${REQUIRED_PYTHON_VERSION} or above`,
    );
  }

  console.log('Installing Python dependencies...');
  const venvResult = await execAsync<string>('python', ['-m', 'venv', '.venv']);
  if (!venvResult.ok) {
    throw new Error(`Python venv failed: ${venvResult.error.message}`);
  }

  if (process.platform !== 'win32') {
    throw new Error('This system does not support non-Windows platforms');
  }

  const pipUpgradeResult = await execAsync('.venv/Scripts/python.exe', [
    '-m',
    'pip',
    'install',
    '--upgrade',
    'pip',
  ]);
  if (!pipUpgradeResult.ok) {
    throw new Error(
      `Python pip upgrade failed: ${pipUpgradeResult.error.message}`,
    );
  }

  const pipInstallResult = await execAsync('.venv/Scripts/python.exe', [
    '-m',
    'pip',
    'install',
    '-r',
    'requirements.txt',
  ]);
  if (!pipInstallResult.ok) {
    throw new Error(
      `Python pip install failed: ${pipInstallResult.error.message}`,
    );
  }

  console.log('Python initialized successfully');
};
