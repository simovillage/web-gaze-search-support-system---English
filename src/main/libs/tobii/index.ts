import { spawn } from 'child_process';
import EventEmitter from 'events';

export const tobiiEmitter = new EventEmitter();

const childProcess = spawn('.venv/Scripts/python.exe', [
  'src/main/libs/tobii/subscribe.py',
]);
