'use strict';
import * as vscode from 'vscode';
import axios from 'axios';
import * as qs from 'qs';
import { Responce, Cached } from './interface';
const Hover = vscode.Hover;
const cached: Cached = {};

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "myfirstextension" is now active!');
	const StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	let disposable = vscode.commands.registerCommand('extension.elTranslate', () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		let selection = editor.selection;
		let text = editor.document.getText(selection);
		StatusBarItem.text = `翻译小工具查询 “${text}” 中...`;
		axios.get('https://translate.googleapis.com/translate_a/single', {
			params: {
				client: 'gtx',
				sl: 'en',
				tl: 'zh-CN',
				hl: 'zh-CN',
				dt: ['t', 'bd'],
				dj: 1,
				source: 'icon',
				tk: (Math.random() * 1000000).toFixed(6),
				q: text
			},
			paramsSerializer: params => {
				return qs.stringify(params, { arrayFormat: 'repeat' });
			}
		}).then(res => {
			StatusBarItem.hide();
			const data: Responce = res.data;
			if (!data.sentences || !data.sentences.length) {
				vscode.window.showInformationMessage('翻译不出来呢...', { modal: true });
			} else {
				let result: string = data.sentences.map(s => s.trans).join('、');
				if (data.dict && data.dict.length) {
					result += '；' + data.dict.map(d => (`${d.pos}: ${d.terms.slice(0, 3).join('，')}`)).join('；');
				}
				cached[text] = result;
				vscode.window.showInformationMessage(result, { modal: true });
			}
		}).catch(res => {
			StatusBarItem.hide();
			vscode.window.showInformationMessage('出错了呢...', { modal: true });
			console.log(res);
		});
	});
	vscode.languages.registerHoverProvider('*', {
		provideHover(document, position, token) {
			let editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}

			let text = document.getText(editor.selection) || document.getText(document.getWordRangeAtPosition(position));
			if (text && cached[text]) {
				return new Hover(cached[text]);
			}
		}
	});
	context.subscriptions.push(disposable);
	context.subscriptions.push(StatusBarItem);
}

export function deactivate() {
}
