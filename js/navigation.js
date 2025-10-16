function navigateToTool(toolName) {
    window.location.href = 'pages/calculator.html';
}

function goHome() {
    window.location.href = '../index.html';
}

// Navigate to Patreon link page
function connectToPatreon() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        window.location.href = 'patreon-link.html';
    } else {
        window.location.href = 'pages/patreon-link.html';
    }
}

// Set up Patreon button click handler when navbar loads
document.addEventListener('navbarLoaded', function() {
    const btnConnectPatreon = document.getElementById('btnConnectPatreon');
    if (btnConnectPatreon) {
        btnConnectPatreon.addEventListener('click', connectToPatreon);
    }
});

// Make functions globally available
window.navigateToTool = navigateToTool;
window.goHome = goHome;
window.connectToPatreon = connectToPatreon;
