import * as vscode from 'vscode';
import * as treeview from './treeview';
import * as cursor from './cursor';


export function activate(context: vscode.ExtensionContext) {
	let treeDataProvider = new treeview.MultiCursorViewerTreeProvider();
	vscode.window.createTreeView(
		'multiCursorViewerView',
		{ treeDataProvider },
	);

	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(() => {
			treeDataProvider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			treeDataProvider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.refresh', () => {
			treeDataProvider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.undo', () => {
			vscode.commands.executeCommand("cursorUndo");
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.redo', () => {
			vscode.commands.executeCommand("cursorRedo");
		})
	);


	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.removeCursor', (item: treeview.MultiCursorViewerTreeItem) => {
			if (item) {
				item.removeCursor();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.cursorStartLeft', (item: treeview.MultiCursorViewerTreeItem) => {
			if (item) {
				item.update(cursor.moveCursorStartLeft);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.cursorStartRight', (item: treeview.MultiCursorViewerTreeItem) => {
			if (item) {
				item.update(cursor.moveCursorStartRight);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.cursorEndLeft', (item: treeview.MultiCursorViewerTreeItem) => {
			if (item) {
				item.update(cursor.moveCursorEndLeft);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.cursorEndRight', (item: treeview.MultiCursorViewerTreeItem) => {
			if (item) {
				item.update(cursor.moveCursorEndRight);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.selectTreeItem', (item: treeview.MultiCursorViewerTreeItem) => {
			if (item) {
				item.select();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('multi-cursor-viewer.replace', () => {
			vscode.window.showInputBox({
				placeHolder: 'Replace (selected text: $1, sequntial number: $$)',
			}).then(inputText => {
				if (inputText === undefined) {
					return;
				}

				let editor = vscode.window.activeTextEditor;
				if (!editor) {
					return;
				}

				editor.edit(editBuilder => {
					if (!editor) {
						return;
					}

					let selections: vscode.Selection[] = [];
					for (let selection of editor.selections) {
						selections.push(selection);
					}
					selections.sort((a, b) => a.start.compareTo(b.start));

					let num = 1;
					for (let selection of selections) {
						let text = editor.document.getText(selection);
						let inputTextNum = inputText.replace(/\$\$/g, num.toString());
						text = text.replace(/(.*)/, inputTextNum);
						editBuilder.replace(selection, text);
						num++;
					}
				});
			});
		})
	);
}

export function deactivate() { }
