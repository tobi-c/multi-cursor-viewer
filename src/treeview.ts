import * as vscode from 'vscode';

export class MultiCursorViewerTreeProvider implements vscode.TreeDataProvider<MultiCursorViewerTreeItem> {
    private multiCursor: boolean = false;
    private treeItems: Array<MultiCursorViewerTreeItem> = [];

    getTreeItem(element: MultiCursorViewerTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MultiCursorViewerTreeItem): Thenable<MultiCursorViewerTreeItem[]> {
        this.updateCursorState();
        this.treeItems = [];
        if (!this.multiCursor) {
            return Promise.resolve(this.treeItems);
        }


        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return Promise.resolve(this.treeItems);
        }

        for (let selection of editor.selections) {
            this.treeItems.push(new MultiCursorViewerTreeItem(editor, selection));
        }

        this.treeItems.sort((a, b) => a.selection.start.compareTo(b.selection.start));
        return Promise.resolve(this.treeItems);
    }

    private _onDidChangeTreeData: vscode.EventEmitter<MultiCursorViewerTreeItem | undefined | null | void> = new vscode.EventEmitter<MultiCursorViewerTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MultiCursorViewerTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this.updateCursorState();
        if (this.multiCursor || this.treeItems.length !== 0) {
            this._onDidChangeTreeData.fire();
        }
    }

    private updateCursorState() {
        let multiCursorOld = this.multiCursor;
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.multiCursor = false;
            this.autoCommand(multiCursorOld);
            return;
        }

        if (editor.selections.length < 2) {
            this.multiCursor = false;
            this.autoCommand(multiCursorOld);
            return;
        }

        this.multiCursor = true;
        this.autoCommand(multiCursorOld);
        return;
    }

    private autoCommand(multiCursorOld: boolean) {
        if (multiCursorOld === this.multiCursor) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        if (this.multiCursor) {
            let config = vscode.workspace.getConfiguration('multi-cursor-viewer');
            let command = config.get("autoCommandMultiCursor") as string;
            if (command !== "") {
                vscode.commands.executeCommand(command).then(() => {
                    setTimeout(() => {
                        if (editor) {
                            vscode.window.showTextDocument(editor.document);
                        }
                    });
                });
            }
        } else {
            let config = vscode.workspace.getConfiguration('multi-cursor-viewer');
            let command = config.get("autoCommandSingleCursor") as string;
            if (command !== "") {
                vscode.commands.executeCommand(command).then(() => {
                    setTimeout(() => {
                        if (editor) {
                            vscode.window.showTextDocument(editor.document);
                        }
                    });
                });
            }
        }

        return;
    }
}

export class MultiCursorViewerTreeItem extends vscode.TreeItem {
    constructor(editor: vscode.TextEditor, public readonly selection: vscode.Selection) {
        let text = editor.document.getText(selection);
        let props = {
            text: text,
            selected: text.length,
            cursorLine: (selection.active.line + 1).toString(),
            cursorCol: (selection.active.character + 1).toString()
        };

        let label = "Ln {line}, Col {col} ({selected} selected)";
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
        text = text.replace("{line}", props.cursorLine);
        text = text.replace("{col}", props.cursorCol);

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
