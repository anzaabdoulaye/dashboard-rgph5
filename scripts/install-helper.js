#!/usr/bin/env node

/**
 * Helper d'installation multi-plateforme
 * Détecte le système d'exploitation et exécute le script approprié
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

console.log('\n=================================================');
console.log('   Installation des Optimisations - Dashboard BCR');
console.log('=================================================\n');

const platform = os.platform();
console.log(`Système détecté: ${platform}\n`);

try {
  if (platform === 'win32') {
    // Windows
    console.log('🪟 Exécution du script Windows (PowerShell)...\n');
    
    const scriptPath = path.join(__dirname, 'install-optimizations.ps1');
    
    try {
      execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.log('\n⚠️  PowerShell a échoué, tentative avec le script Batch...\n');
      
      const batchPath = path.join(__dirname, 'install-optimizations.bat');
      execSync(`"${batchPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    }
  } else if (platform === 'linux' || platform === 'darwin') {
    // Linux ou macOS
    console.log('🐧 Exécution du script Linux/macOS (Bash)...\n');
    
    const scriptPath = path.join(__dirname, 'install-optimizations.sh');
    
    // Rendre le script exécutable
    try {
      execSync(`chmod +x "${scriptPath}"`);
    } catch (error) {
      // Ignorer si chmod échoue
    }
    
    execSync(`bash "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } else {
    console.error('❌ Système d\'exploitation non supporté:', platform);
    console.log('\nVeuillez installer manuellement en suivant INSTALLATION_WINDOWS.md ou OPTIMIZATIONS.md');
    process.exit(1);
  }
  
  console.log('\n✅ Installation terminée!\n');
} catch (error) {
  console.error('\n❌ Erreur lors de l\'installation:', error.message);
  console.log('\n📚 Consultez les guides d\'installation:');
  
  if (platform === 'win32') {
    console.log('   - INSTALLATION_WINDOWS.md (pour Windows)');
  } else {
    console.log('   - OPTIMIZATIONS.md (pour Linux/macOS)');
  }
  
  process.exit(1);
}
