	import * as vscode from 'vscode';

	export class EffektInlayHintsProvider {
	private disposables: vscode.Disposable[] = [];
	private isKeyPressed: boolean = false;

	constructor() {
		// Register for key events if using OffUnlessPressed mode
		this.registerKeyHandlers();
		
		// Register for configuration changes
		this.disposables.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('effekt.inlayHints')) {
			this.refreshInlayHints();
			}
		})
		);
	}

	public dispose() {
		this.disposables.forEach(d => d.dispose());
	}

	private registerKeyHandlers() {
		// Register command for key press handling
		this.disposables.push(
		vscode.commands.registerCommand('effekt.showInlayHintsOnKey', () => {
			this.isKeyPressed = true;
			this.refreshInlayHints();
			
			// Set a timeout to reset key state
			setTimeout(() => {
			this.isKeyPressed = false;
			this.refreshInlayHints();
			}, 2000); // Reset after 2 seconds
		})
		);
	}

	private refreshInlayHints() {
		vscode.commands.executeCommand('editor.action.inlayHints.refresh');
	}

	public shouldShowCaptureHints(document: vscode.TextDocument): boolean {
		const config = vscode.workspace.getConfiguration('effekt.inlayHints', document.uri);
		const mode = config.get<string>('mode', 'On');
		
		// Check global mode setting
		if (mode === 'Off') {
		return false;
		}
		
		if (mode === 'OffUnlessPressed' && !this.isKeyPressed) {
		return false;
		}
		
		// Check capture-specific setting
		return config.get<boolean>('captures', true);
	}
	}