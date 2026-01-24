
(async () => {
    try {
        await import('./server/index.mjs');
        console.log('Server started via CJS wrapper');
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();
