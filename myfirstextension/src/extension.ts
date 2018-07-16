'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import * as qs from 'qs';

interface sentenceItem {
	backend: number;
	orig: string;
	trans: string;
}
interface dictItem {
	pos: string;
	terms: string[];
}
interface responce {
	dict: dictItem[];
	sentences: sentenceItem[];
	src: string;
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "myfirstextension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
		// The code you place here will be executed every time your command is executed

		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		let selection = editor.selection;
		let text = editor.document.getText(selection);

		axios.get('https://translate.googleapis.com/translate_a/single', {
			params: {
				client: 'gtx',
				sl: 'en',
				tl: 'zh-CN',
				hl: 'zh-CN',
				dt: ['t', 'bd'],
				dj: 1,
				source: 'icon',
				tk: 0,
				q: text
			},
			paramsSerializer: params => {
				return qs.stringify(params, { arrayFormat: 'repeat' });
			}
		}).then(res => {
			const data: responce = res.data;
			let text: string = data.sentences.map(s => s.trans).join('、') + '；' + data.dict.map(d => (`${d.pos}: ${d.terms.slice(0, 3).join('，')}`)).join('；');
			vscode.window.showInformationMessage(text, { modal: true });
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
