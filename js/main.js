document.addEventListener('alpine:init', () => {
    Alpine.data('figyusz', () => ({
        isModalOpen: false,
        modalText: '',
        eventgeneratorList: [],
        formData: null,
        validation: null,
        selectedEg: null,
        clearFormData() {
            this.formData = {
                email: null,
                eventgenerator: null,
                parameter: null,
                eventtype: '1',
            }
        },
        init() {
            fetch(new URL('/templates/header.html', document.URL))
                .then(response => response.text())
                .then(html => this.$refs.header.innerHTML = html);

            fetch(new URL('/templates/footer.html', document.URL))
                .then(response => response.text())
                .then(html => this.$refs.footer.innerHTML = html);

            fetch(new URL('/templates/innerfooter.html', document.URL))
                .then(response => response.text())
                .then(html => this.$refs.innerfooter.innerHTML = html);

            this.clearFormData();
            fetch(new URL('/api/eventgenerators', API_URL))
                .then((response) => response.json())
                .then((data) => {
                    this.eventgeneratorList = data.data;
                });
        },
        save() {
            fetch(new URL('/api/subscriptions', API_URL), {
                method: 'POST',
                body: new URLSearchParams(this.formData)
            })
                .then((response) => response.json())
                .then((respdata) => {
                    if (respdata.success) {
                        this.modalText = 'Küldtünk egy emailt a megerősítő linkkel, klikkelj rá!';
                        this.isModalOpen = true;
                        this.clearFormData();
                    } else {
                        this.validation = respdata.fields;
                        this.modalText = 'Hibásan töltötted ki a mezőket.';
                        this.isModalOpen = true;
                    }
                })
                .catch((error) => {
                    alert(error);
                })
                .finally(() => {
                });
        }
    }));
});
