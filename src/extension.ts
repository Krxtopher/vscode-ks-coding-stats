import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.debug("KS Coding Stats: activated");
  let contentChangeTracker = new StatsTracker();
  context.subscriptions.push(contentChangeTracker);
}

export function deactivate() {
  console.debug("KS Coding Stats: deactivated");
}

class StatsTracker implements vscode.Disposable {
  private static modeCount = 3;
  private modeIndex = 0;

  private statusBarItem: vscode.StatusBarItem;
  private eventHandlers: vscode.Disposable[] = [];
  private keyCounts: Map<vscode.Uri, number> = new Map();
  private characterCounts: Map<vscode.Uri, number> = new Map();

  constructor() {
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

    this.displayStats();
  }

  displayStats() {
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
    const activeTextEditorDocumentUri =
      vscode.window.activeTextEditor?.document.uri;

    if (!activeTextEditorDocumentUri) {
      this.statusBarItem.text = "";
      return;
    }

    const keyCount = this.keyCounts.get(activeTextEditorDocumentUri) || 0;
    const characterCount =
      this.characterCounts.get(activeTextEditorDocumentUri) || 0;
    const boostMultiplier = characterCount / keyCount;

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
    const activeTextEditorDocumentUri =
      vscode.window.activeTextEditor?.document.uri;

    if (!activeTextEditorDocumentUri) {
      return;
    }

    const keyCount = this.keyCounts.get(activeTextEditorDocumentUri) || 0;
    const characterCount =
      this.characterCounts.get(activeTextEditorDocumentUri) || 0;

    // Update the status bar
    this.statusBarItem.text = `${characterCount} chars | ${keyCount} keystrokes`;

    // Show the status bar
    this.statusBarItem.show();
  }

  displayTypingReductionStats() {
    const activeTextEditorDocumentUri =
      vscode.window.activeTextEditor?.document.uri;

    if (!activeTextEditorDocumentUri) {
      this.statusBarItem.text = "";
      return;
    }

    const keyCount = this.keyCounts.get(activeTextEditorDocumentUri) || 0;
    const characterCount =
      this.characterCounts.get(activeTextEditorDocumentUri) || 0;
    const typingReduction = Math.round((1 - keyCount / characterCount) * 100);
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
    this.displayStats();
  }

  resetStats() {
    this.keyCounts.clear();
    this.characterCounts.clear();
    this.displayStats();
  }

  onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
    this.displayStats();
  }

  onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
    const activeTextEditorDocumentUri =
      vscode.window.activeTextEditor?.document.uri;

    if (
      activeTextEditorDocumentUri !== event.document.uri ||
      event.contentChanges.length === 0
    ) {
      return;
    }

    // Update the key count
    let keyCount = this.keyCounts.get(event.document.uri) || 0;
    keyCount++;
    this.keyCounts.set(event.document.uri, keyCount);

    // Update the character count
    let characterCount = this.characterCounts.get(event.document.uri) || 0;
    const deleteCount = event.contentChanges[0].rangeLength;
    characterCount += event.contentChanges[0].text.length - deleteCount;
    this.characterCounts.set(event.document.uri, characterCount);

    this.displayStats();
  }

  dispose() {
    // Dispose of all disposables
    this.eventHandlers.forEach((d) => d.dispose());

    // Dispose of the status bar item
    this.statusBarItem.dispose();
  }
}
