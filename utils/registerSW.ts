export function registerServiceWorker() {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
        window.addEventListener('load', function () {
            navigator.serviceWorker
                .register('/sw.js')
                .then(function (registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function (err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}
