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
                    for (let i = 0; i < this.eventgeneratorList.length; i++) {
                        if (this.eventgeneratorList[i].options_schema) {
                            for (let j = 0; j < this.eventgeneratorList[i].options_schema.length; j++) {
                                this.eventgeneratorList[i].options_schema[j].form_name = "option_" + this.eventgeneratorList[i].options_schema[j].id;
                            }
                        }
                    }
                });
            this.$watch('formData.eventgenerator', () => {
                this.$nextTick(() => {
                    document.querySelectorAll('.select2').forEach(el => {
                        $(el).select2({placeholder: 'Válassz a lehetőségek közül', closeOnSelect: false});
                    });
                });
            });
        },
        save() {
            const formData = new URLSearchParams();
            for (const key in this.formData) {
                if (Array.isArray(this.formData[key])) {
                    this.formData[key].forEach(value => formData.append(key, value));
                } else {
                    formData.append(key, this.formData[key]);
                }
            }
            document.querySelectorAll('.select2').forEach(select => {
                const name = select.getAttribute('id')?.replace('select_option_', 'option_');
                if (name) {
                    $(select).val().forEach(value => formData.append(name, value));
                }
            });
            fetch(new URL('/api/subscriptions', API_URL), {
                method: 'POST',
                body: formData
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
