import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.debug("KS Coding Stats: activated");
  let contentChangeTracker = new StatsTracker(context);
  context.subscriptions.push(contentChangeTracker);
}

export function deactivate() {
  console.debug("KS Coding Stats: deactivated");
}

class StatsTracker implements vscode.Disposable {
  private globalState: vscode.Memento;
  private static modeCount = 3;
  private modeIndex = 0;

  private statusBarItem: vscode.StatusBarItem;
  private eventHandlers: vscode.Disposable[] = [];

  private activeDocumentUri: vscode.Uri | undefined;

  get keyCount(): number {
    if (!this.activeDocumentUri) return 0;
    return this.globalState.get(
      `${this.activeDocumentUri.toString()}-keyCount`,
      0
    );
  }

  set keyCount(value: number) {
    if (!this.activeDocumentUri) return;
    this.globalState.update(
      `${this.activeDocumentUri.toString()}-keyCount`,
      value
    );
  }

  get charCount(): number {
    if (!this.activeDocumentUri) return 0;
    return this.globalState.get(
      `${this.activeDocumentUri.toString()}-charCount`,
      0
    );
  }

  set charCount(value: number) {
    if (!this.activeDocumentUri) return;
    this.globalState.update(
      `${this.activeDocumentUri.toString()}-charCount`,
      value
    );
  }

  constructor(context: vscode.ExtensionContext) {
    this.globalState = context.globalState;
    this.activeDocumentUri = vscode.window.activeTextEditor?.document.uri;

    // Create a new stats bar item.
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );

    // Set the status bar command.
    this.statusBarItem.command = "ks-coding-stats.cycleStatusBarMode";
    this.statusBarItem.tooltip = "Click to cycle through stats";

    // Register the "statusBarClick" command.
    const cycleStatusBarModeHandler = vscode.commands.registerCommand(
      "ks-coding-stats.cycleStatusBarMode",
      this.cycleStatusBarMode,
      this
    );
    this.eventHandlers.push(cycleStatusBarModeHandler);

    // Register the "resetStats" command.
    const resetStatsHandler = vscode.commands.registerCommand(
      "ks-coding-stats.resetStats",
      this.resetStats,
      this
    );
    this.eventHandlers.push(resetStatsHandler);

    // Register a listener for active document changes.
    vscode.window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor,
      this,
      this.eventHandlers
    );

    // Register a listener for text document changes.
    vscode.workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument,
      this,
      this.eventHandlers
    );

    this.render();
  }

  render() {
    if (!this.activeDocumentUri) {
      this.statusBarItem.text = "";
      return;
    }

    switch (this.modeIndex) {
      case 0:
        this.displayXFactorStats();
        break;
      case 1:
        this.displayTypingReductionStats();
        break;
      case 2:
        this.displayCharsPerKeyStats();
        break;
    }
  }

  displayXFactorStats() {
    const boostMultiplier = this.charCount / this.keyCount;

    // Update the status bar
    if (isNaN(boostMultiplier)) {
      this.statusBarItem.text = "-- coding boost";
    } else {
      this.statusBarItem.text = `${boostMultiplier.toFixed(1)}x coding boost`;
    }

    // Show the status bar
    this.statusBarItem.show();
  }

  displayCharsPerKeyStats() {
    // Update the status bar
    this.statusBarItem.text = `${this.charCount} chars | ${this.keyCount} keystrokes`;

    // Show the status bar
    this.statusBarItem.show();
  }

  displayTypingReductionStats() {
    const typingReduction = Math.round(
      (1 - this.keyCount / this.charCount) * 100
    );
    if (isNaN(typingReduction)) {
      this.statusBarItem.text = "-- typing reduction";
    } else if (!isFinite(typingReduction)) {
      this.statusBarItem.text = "-∞ typing reduction";
    } else {
      this.statusBarItem.text = `${typingReduction}% typing reduction`;
    }

    // Show the status bar
    this.statusBarItem.show();
  }

  cycleStatusBarMode() {
    this.modeIndex = (this.modeIndex + 1) % StatsTracker.modeCount;
    this.render();
  }

  resetStats() {
    this.keyCount = 0;
    this.charCount = 0;
    this.render();
  }

  onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
    this.activeDocumentUri = editor?.document.uri;
    console.debug(`active document: ${this.activeDocumentUri}`);
    this.render();
  }

  onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
    if (
      this.activeDocumentUri !== event.document.uri ||
      event.contentChanges.length === 0
    ) {
      return;
    }

    this.keyCount += 1;

    const deleteCount = event.contentChanges[0].rangeLength;
    this.charCount += event.contentChanges[0].text.length - deleteCount;

    this.render();
  }

  dispose() {
    // Dispose of all disposables
    this.eventHandlers.forEach((d) => d.dispose());

    // Dispose of the status bar item
    this.statusBarItem.dispose();
  }
}
