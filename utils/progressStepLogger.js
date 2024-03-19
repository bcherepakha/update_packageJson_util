import chalk from 'chalk';

export class SimpleLogger {
  normal(text) {
    console.log(text);
  }

  success(text) {
    console.log('\x1b[32m%s\x1b[0m', text);
  }

  error(text) {
    console.log('\x1b[31m%s\x1b[0m', text);
  }

  saveLog() {}

  addTaskLog(taskDescription, status) {
    this.normal(taskDescription);
  }

  updateTaskLog(taskDescription, status) {}

  end() {}

  addError(text) {
    this.error(text);
  }

  addLog(text, status) {
    if (status === ProgressStepLogger.STATUS.ERROR) {
      this.error(text);
    } else if (status === ProgressStepLogger.STATUS.SUCCESS) {
      this.success(text);
    } else {
      this.normal(text);
    }
  }
}

export class ProcessStdoutLogger {
  saveLog() {
    process.stdout.write('\n');
  }

  getTaskStatusColorText(text, status) {
    if (status === ProgressStepLogger.STATUS.ERROR) {
      return chalk.red(text);
    } else if (status === ProgressStepLogger.STATUS.SUCCESS) {
      return chalk.green(text);
    }

    return chalk.blue(text);
  }

  getTaskStatusText(status) {
    return this.getTaskStatusColorText(getSymbolDescription(status), status);
  }

  addTaskLog(taskDescription, status) {
    process.stdout.write(chalk.white(taskDescription) + ' ' + this.getTaskStatusText(status));
  }

  updateTaskLog(taskDescription, status) {
    process.stdout.write('\r');
    process.stdout.clearLine();
    this.addTaskLog(taskDescription, status);
  }

  end() {
    process.stdout.end();
  }

  addError(text) {
    process.stdout.write('\n\r');
    process.stdout.clearLine();
    process.stdout.write(chalk.red(text));
  }

  addLog(text, status) {
    process.stdout.write('\n');
    process.stdout.clearLine();
    process.stdout.write(this.getTaskStatusColorText(text, status));
  }
}

function getSymbolDescription(symbol) {
  return symbol.description || symbol.toString();
}

export class ProgressStepLogger {
  static STATUS = Object.freeze({
    STARTED: Symbol.for('STARTED'),
    SUCCESS: Symbol.for('SUCCESS'),
    ERROR: Symbol.for('ERROR')
  })

  constructor(logger = new SimpleLogger()) {
    this.steps = [];
    this.currentStep = 0;
    this.logger = logger
  }

  startTask(taskDescription) {
    this.currentStep++;

    const task = {
      text: taskDescription,
      status: ProgressStepLogger.STATUS.STARTED
    };

    this.steps.push(task);

    this.logger.saveLog();
    this.logger.addTaskLog(`${this.currentStep}. ${task.text}...`, task.status);
  }

  complete(status) {
    const task = this.steps[this.currentStep - 1];

    task.status = status;

    this.logger.updateTaskLog(`${this.currentStep}. ${task.text}...`, task.status);
  }

  end() {
    this.logger.end();
  }

  setErrorMessage(text, taskNumber = this.currentStep - 1) {
    this.steps[this.currentStep - 1].error = text;

    this.logger.addError(text);
  }

  addLog(text, status) {
    this.logger.addLog(text, status);
    this.logger.saveLog();
  }
}
