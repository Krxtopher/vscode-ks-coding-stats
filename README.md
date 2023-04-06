Use this extension to measure how much your coding productivity improves when using code assist features like **IntelliSense** and **snippets** as well as AI coding companions like **Amazon CodeWhisperer** and **GitHub Copilot**.

## How to use

The extension adds a new item to the VS Code status bar. As you type, the stats displayed in this bar will update. Stats reflect only the file you are currently editing and are reset each time you reopen the file.

The extension provides three different views which you cycle through by clicking on the status bar item.

**Coding boost**

![6.7x coding boost](./doc-images/coding-boost.png)

**Typing reduction**

![85% typing reduction](./doc-images/typing-reduction.png)

**Characters per keystroke**

![709 chara | 106 keystrokes](./doc-images/chars-per-key.png)

## How it works

**KS Code Stats** keeps track of two things:

- number of _keystrokes_
- number of _characters_ added or removed with each keystroke

When a keystroke results in multiple characters being added to the document, your efficiency stats increase. When a keystroke removes characters—such as when pressing **Delete**—your efficiency stats decrease.

## Contact me

I'd love to hear from you! Report bugs or request new features by [submitting issues on Github](https://github.com/Krxtopher/vscode-ks-coding-stats/issues).

## License

MIT-0
