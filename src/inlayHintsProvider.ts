import * as vscode from 'vscode';

export class EffektInlayHintsProvider {
  private disposables: vscode.Disposable[] = [];
  private isKeyPressed: boolean = false;
  private keyPressTimer: NodeJS.Timeout | null = null;

  constructor() {

	this.registerKeyHandlers();
    
    // Register for configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('effekt.inlayHints')) {
		  console.log('Inlay hints configuration changed'); // Debug logging
		  }
      })
    );
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
    if (this.keyPressTimer) {
      clearTimeout(this.keyPressTimer);
    }
  }

  private registerKeyHandlers() {
    // Command for when key is pressed
    this.disposables.push(
      vscode.commands.registerCommand('effekt.showInlayHintsOnKey', () => {
        console.log('Inlay hints key pressed'); // Debug logging
        
        // Set key pressed state
        this.isKeyPressed = true;
        
    
        // If there's an existing timer, clear it
        if (this.keyPressTimer) {
          clearTimeout(this.keyPressTimer);
        }
        
        // Set timer to reset state when key is released
        this.keyPressTimer = setTimeout(() => {
          console.log('Inlay hints key released (timeout)'); // Debug logging
          this.isKeyPressed = false;
          this.keyPressTimer = null;
        }, 3000); // Increase timeout to 3 seconds for testing
      })
    );
    
    // Listen for editor focus change as a backup way to detect key release
    this.disposables.push(
      vscode.window.onDidChangeWindowState(() => {
        if (this.isKeyPressed) {
          console.log('Window state changed, resetting key state'); // Debug logging
          this.isKeyPressed = false;
          
          if (this.keyPressTimer) {
            clearTimeout(this.keyPressTimer);
            this.keyPressTimer = null;
          }
        }
      })
    );
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