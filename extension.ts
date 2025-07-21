// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, workspace, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
export function activate(ctx: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Wordcount" is now active!');

    // create a new word counter
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);

    // add to a list of disposables which are disposed when this extension
    // is deactivated again.
    ctx.subscriptions.push(controller);
    ctx.subscriptions.push(wordCounter);
}

export class WordCounter {

    private _statusBarItem!: StatusBarItem;

    public updateWordCount() {
        
        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        } 

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if an MD file
        if (doc.languageId === "markdown") {
            let total = this._countAll(doc.getText());
            let selection = editor.selection && !editor.selection.isEmpty
                ? this._countAll(editor.document.getText(editor.selection))
                : null;
            let format = (c: { en: number, ch: number, emoji: number }) => {
                const parts = [];
                var hasWord = false;
                if (c.en > 0) {
                    hasWord = true;
                    parts.push(`En: ${c.en}`);
                }
                if (c.ch > 0) {
                    hasWord = true;
                    parts.push(`Ch: ${c.ch}`);
                }
                if (c.emoji > 0) {
                    hasWord = true;
                    parts.push(`Emoji: ${c.emoji}`);
                }
                return hasWord ? parts.join('; ') + ' (Word)' : '0 Word';
            };
            let text = selection
                ? `$(pencil) ${format(selection)}`
                : `$(pencil) ${format(total)}`;
            this._statusBarItem.text = text;
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    /**
     * Statistics of English word count, Chinese character count, and emoji count
     */
    private _countAll(text: string): { en: number, ch: number, emoji: number } {
        // Remove HTML tags and extra whitespace
        text = text.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        text = text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        // English words
        const en = (text.match(/[a-zA-Z0-9_\-']+/g) || []).length;
        // Chinese characters (including Han characters, Japanese Kanji, some CJK and common Chinese punctuation)
        const ch = (text.match(/[\u4e00-\u9fa5\u3400-\u4dbf\uF900-\uFAFF\u3000-\u303F\uff00-\uffef]/g) || []).length;
        // emoji (common emoji range, supports most emojis)
        const emoji = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
        return { en, ch, emoji };
    }

    public _getSelectionWordCount(editor: typeof window.activeTextEditor): number {
        if (!editor) return 0;
        let selection = editor.selection;
        if (selection && !selection.isEmpty) {
            return this._countAll(editor.document.getText(selection)).en;
        }
        return 0;
    }

    public _getWholeWordCount(doc: TextDocument): number {
        return this._countAll(doc.getText()).en;
    }

    public dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCounterController {

    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter) {
        this._wordCounter = wordCounter;
        this._wordCounter.updateWordCount();

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }

    public dispose() {
        this._disposable.dispose();
    }
}
