document.addEventListener('alpine:init', () => {
    Alpine.data('confirm', () => ({
        success: null,
        init() {
            let myUrlParams = new URLSearchParams(window.location.search);

            fetch(new URL('/api/subscriptions/confirm/' + myUrlParams.get('s'), API_URL))
                .then((response) => response.json())
                .then((data) => {
                    this.success = data.success;
                });
        },
    }));
});
