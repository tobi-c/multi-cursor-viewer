import * as vscode from 'vscode';

export function moveCursorStartLeft(editor: vscode.TextEditor, selection: vscode.Selection): vscode.Selection {
    if (selection.isReversed) {
        selection = new vscode.Selection(selection.anchor, positionPrev(editor, selection.active));
    } else {
        selection = new vscode.Selection(positionPrev(editor, selection.anchor), selection.active);
    }

    return selection;
}

export function moveCursorEndRight(editor: vscode.TextEditor, selection: vscode.Selection): vscode.Selection {
    if (selection.isReversed) {
        selection = new vscode.Selection(positionNext(editor, selection.anchor), selection.active);
    } else {
        selection = new vscode.Selection(selection.anchor, positionNext(editor, selection.active));
    }

    return selection;
}

export function moveCursorStartRight(editor: vscode.TextEditor, selection: vscode.Selection): vscode.Selection {
    if (!selection.isEmpty) {
        if (selection.isReversed) {
            selection = new vscode.Selection(selection.anchor, positionNext(editor, selection.active));
        } else {
            selection = new vscode.Selection(positionNext(editor, selection.anchor), selection.active);
        }
    }

    return selection;
}


export function moveCursorEndLeft(editor: vscode.TextEditor, selection: vscode.Selection): vscode.Selection {
    if (!selection.isEmpty) {
        if (selection.isReversed) {
            selection = new vscode.Selection(positionPrev(editor, selection.anchor), selection.active);
        } else {
            selection = new vscode.Selection(selection.anchor, positionPrev(editor, selection.active));
        }
    }

    return selection;
}

function positionPrev(editor: vscode.TextEditor, pos: vscode.Position): vscode.Position {
    if (pos.character !== 0) {
        pos = pos.translate(0, -1);
    } else if (pos.line !== 0) {
        let line = pos.line - 1;
        let ch = editor.document.lineAt(line).range.end.character;
        pos = new vscode.Position(line, ch);
    }

    return pos;
}

function positionNext(editor: vscode.TextEditor, pos: vscode.Position): vscode.Position {
    let ch = editor.document.lineAt(pos.line).range.end.character;
    if (pos.character === ch) {
        if (pos.line !== (editor.document.lineCount - 1)) {
            pos = new vscode.Position(pos.line + 1, 0);
        }
    } else {
        pos = pos.translate(0, 1);
    }

    return pos;
}
