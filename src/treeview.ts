import * as vscode from 'vscode';

export class MultiCursorViewerTreeProvider implements vscode.TreeDataProvider<MultiCursorViewerTreeItem> {
    private multiCursor: boolean = false;

    getTreeItem(element: MultiCursorViewerTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MultiCursorViewerTreeItem): Thenable<MultiCursorViewerTreeItem[]> {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.multiCursor = false;
            return Promise.resolve([]);
        }

        if (editor.selections.length < 2) {
            this.multiCursor = false;
            return Promise.resolve([]);
        }

        this.multiCursor = true;
        let treeItems = [];
        for (let selection of editor.selections) {
            treeItems.push(new MultiCursorViewerTreeItem(editor, selection));
        }

        treeItems.sort((a, b) => a.selection.start.compareTo(b.selection.start));
        return Promise.resolve(treeItems);
    }

    private _onDidChangeTreeData: vscode.EventEmitter<MultiCursorViewerTreeItem | undefined | null | void> = new vscode.EventEmitter<MultiCursorViewerTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MultiCursorViewerTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        if (editor.selections.length < 2 && !this.multiCursor) {
            return;
        }

        this._onDidChangeTreeData.fire();
    }
}

export class MultiCursorViewerTreeItem extends vscode.TreeItem {
    constructor(editor: vscode.TextEditor, public readonly selection: vscode.Selection) {
        let text = editor.document.getText(selection);
        let props = {
            text: text,
            selected: text.length,
            startLine: (selection.start.line + 1).toString(),
            startCol: (selection.start.character + 1).toString()
        };

        let label = "Ln {startLine}, Col {startCol} ({selected} selected)";
        let description = "{text}";

        label = MultiCursorViewerTreeItem.replaceText(label, props);
        description = MultiCursorViewerTreeItem.replaceText(description, props);

        super(label);
        this.description = description;
        this.iconPath = new vscode.ThemeIcon("selection");
        this.command = {
            command: "multi-cursor-viewer.selectTreeItem",
            arguments: [this],
            title: "selectTreeItem"
        };
    }

    private static replaceText(text: string, props: any): string {
        text = text.replace("{text}", props.text);
        text = text.replace("{selected}", props.selected);
        text = text.replace("{startLine}", props.startLine);
        text = text.replace("{startCol}", props.startCol);

        return text;
    }

    removeCursor() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let selections = [];
        for (let selection of editor.selections) {
            if (!selection.isEqual(this.selection)) {
                selections.push(selection);
            }
        }
        editor.selections = selections;
    }

    select() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.revealRange(this.selection, vscode.TextEditorRevealType.AtTop);
    }

    update(updateFn: (editor: vscode.TextEditor, selecton: vscode.Selection) => vscode.Selection) {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let selections = [];
        for (let selection of editor.selections) {
            if (selection.isEqual(this.selection)) {
                selection = updateFn(editor, selection);
            }

            selections.push(selection);
        }
        editor.selections = selections;
    }
}
