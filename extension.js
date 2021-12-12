const vscode = require('vscode')
const api = require('./translate-api')


function activate(context) {
	const disposable = vscode.commands.registerCommand('translate.entoru', async function () {

		let selectWord
		const currentEditor = vscode.window.activeTextEditor
		if (!currentEditor) return
		const currentSelect = currentEditor.document.getText(currentEditor.selection)
		if (!currentSelect) return
		const data = await api.translate(currentSelect, 'en', 'ru')

	

		const result = data.data.trans_result[0].dst
		const list = result.split(' ')
		if (list.length > 1) {
			const arr = []
			arr.push(list.map((v, i) => {
				if (i !== 0) {
					return v.charAt(0).toLocaleUpperCase() + v.slice(1)
				}
				return v.toLocaleLowerCase()
			}).join(''))
			arr.push(list.map(v => v.toLocaleLowerCase()).join('_'))
			arr.push(list.map(v => v.charAt(0).toLocaleUpperCase() + v.slice(1)).join(''))
			selectWord = await vscode.window.showQuickPick(arr, { placeHolder: 'Choose the best option' })
		} else {
			selectWord = list[0]
		}

		if (selectWord) {
			currentEditor.edit(editBuilder => {
				editBuilder.replace(currentEditor.selection, selectWord)
			})
		}
	})

	context.subscriptions.push(disposable)
}
exports.activate = activate

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
