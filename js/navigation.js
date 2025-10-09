function navigateToTool(toolName) {
    window.location.href = 'pages/calculator.html';
}

function goHome() {
    window.location.href = '../index.html';
}

// Make functions globally available
window.navigateToTool = navigateToTool;
window.goHome = goHome;
