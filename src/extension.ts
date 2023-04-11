import * as vscode from "vscode";

/**
 * Called when the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
  console.debug("KS Coding Stats: activated 1");
  let contentChangeTracker = new StatsTracker(context);
  context.subscriptions.push(contentChangeTracker);
}

/**
 * Called when the extension is deactivated.
 */
export function deactivate() {
  console.debug("KS Coding Stats: deactivated");
}

/**
 * StatsTracker implements all logic for this extension.
 */
class StatsTracker implements vscode.Disposable {
  private globalState: vscode.Memento;
  private static modeCount = 3;
  private modeIndex = 0;

  private statusBarItem: vscode.StatusBarItem;
  private eventHandlers: vscode.Disposable[] = [];

  private activeDocumentUri: vscode.Uri | undefined;

  /**
   * The number of keystrokes detected.
   */
  get keyCount(): number {
    if (!this.activeDocumentUri) {
      return 0;
    }
    return this.globalState.get(
      `${this.activeDocumentUri.toString()}-keyCount`,
      0
    );
  }

  set keyCount(value: number) {
    if (!this.activeDocumentUri) {
      return;
    }
    this.globalState.update(
      `${this.activeDocumentUri.toString()}-keyCount`,
      value
    );
  }

  /**
   * The net number of characters produced.
   */
  get charCount(): number {
    if (!this.activeDocumentUri) {
      return 0;
    }
    return this.globalState.get(
      `${this.activeDocumentUri.toString()}-charCount`,
      0
    );
  }

  set charCount(value: number) {
    if (!this.activeDocumentUri) {
      return;
    }
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

    this.statusBarItem.command = "ks-coding-stats.cycleStatusBarMode";
    this.statusBarItem.tooltip = "Click to cycle through stats";
    this.statusBarItem.show();

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
      this.handleDidChangeActiveTextEditor,
      this,
      this.eventHandlers
    );

    // Register a listener for text document changes.
    vscode.workspace.onDidChangeTextDocument(
      this.handleDidChangeTextDocument,
      this,
      this.eventHandlers
    );

    this.render();
  }

  /**
   * Updates the status bar visuals.
   */
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
  }

  displayCharsPerKeyStats() {
    // Update the status bar
    this.statusBarItem.text = `${this.charCount} chars | ${this.keyCount} keystrokes`;
  }

  displayTypingReductionStats() {
    if (this.charCount === 0) {
      this.statusBarItem.text = "0% typing reduction";
      return;
    }

    const typingReduction = 1 - this.keyCount / this.charCount;

    if (typingReduction < 0) {
      const increasePercent = Math.round((1 - typingReduction - 1) * 100);
      this.statusBarItem.text = `⚠ -${increasePercent}% typing reduction`;
      return;
    }

    const decreasePercent = Math.round(typingReduction * 100);
    this.statusBarItem.text = `${decreasePercent}% reduction`;
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

  handleDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
    this.activeDocumentUri = editor?.document.uri;
    console.debug(`active document: ${this.activeDocumentUri}`);
    this.render();
  }

  handleDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
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
