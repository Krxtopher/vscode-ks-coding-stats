Use this extension to measure how much your coding productivity improves when using code assist features like **IntelliSense** and **snippets** as well as AI coding companions like **Amazon CodeWhisperer** and **GitHub Copilot**.

https://user-images.githubusercontent.com/1727699/230802342-9c064402-48b2-418f-bf7d-a9524af7e755.mp4

## Installation

Download the .vsix file from the [latest release](https://github.com/Krxtopher/vscode-ks-coding-stats/releases) from GitHub.

Install the .vsix file you downloaded by opening the Extensions panel in VS Code an selecting the option to "Install from VSIX..."

![Install from VSIX](./doc-images/vsix-install.png)

## How to use

As you type, stats about your coding efficiency will be displayed in the status bar at the bottom of the VS Code window. Stats reflect the file you are currently editing.

The extension provides three different views which you cycle through by clicking on the status bar item.

**Coding boost**

![6.7x coding boost](./doc-images/coding-boost.png)

**Typing reduction**

![85% typing reduction](./doc-images/typing-reduction.png)

**Characters & keystrokes**

![709 chara | 106 keystrokes](./doc-images/chars-per-key.png)

### Resetting stats

Stats for each file will persist even after you quit VS Code. If you would like to reset the stats for a file, open that file, then run the "**KS Coding Stats: Reset stats for file**" command from the Command Palette.



## How it works

**KS Coding Stats** keeps track of two things:

- number of _keystrokes_
- number of _characters_ added or removed with each keystroke

When a keystroke results in multiple characters being added to the document, your efficiency stats improve. When a keystroke removes characters—such as when pressing **Backspace** or **Delete**—your efficiency stats decline.

## Contact me

I'd love to hear from you! Report bugs or request new features by [submitting issues on Github](https://github.com/Krxtopher/vscode-ks-coding-stats/issues).

## License

MIT-0
