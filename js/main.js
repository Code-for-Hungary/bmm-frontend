document.addEventListener('alpine:init', () => {
    Alpine.data('figyusz', () => ({
        isModalOpen: false,
        isManageModalOpen: false,
        manageEmail: null,
        modalText: '',
        eventgeneratorList: [],
        formData: null,
        validation: null,
        selectedEg: null,
        formSubmitted: false,
        isSubmitting: false,
        
        isValidEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },
        
        validateForm() {
            let isValid = true;
            
            // Reset validation state
            this.formSubmitted = true;
            
            // Check email
            if (!this.formData.email || !this.isValidEmail(this.formData.email)) {
                isValid = false;
            }
            
            // Check parameter if event type is 1 (search for expression)
            if (this.formData.eventtype === '1' && !this.formData.parameter) {
                isValid = false;
            }
            
            // Check if event generator is selected
            if (!this.formData.eventgenerator) {
                isValid = false;
            }
            
            return isValid;
        },
        
        // Clear form data and validation state
        clearFormData() {
            this.formData = {
                email: null,
                eventgenerator: null,
                parameter: null,
                eventtype: '1',
            };
            this.formSubmitted = false;
        },
        
        // Initialize the component
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
                setTimeout(() => {
                    // First, destroy all existing Select2 instances
                    document.querySelectorAll('.select2-container').forEach(container => {
                        container.remove();
                    });

                    document.querySelectorAll('.select2').forEach(el => {
                        if ($(el).hasClass('select2-hidden-accessible')) {
                            $(el).select2('destroy');
                        }

                        // Remove any leftover classes
                        $(el).removeClass('select2-hidden-accessible');

                        // Initialize fresh Select2 instances
                        $.fn.select2.defaults.set('language', 'hu');
                        $(el).select2({
                            placeholder: 'Válassz a lehetőségek közül', 
                            closeOnSelect: false, 
                            language: "hu",
                            width: '100%',
                        });
                    });
                }, 50); // Short delay to ensure DOM is ready
            });

            // Make Select2 more accessible
            this.$nextTick(() => {
                $(document).on('select2:open', () => {
                    document.querySelector('.select2-search__field').focus();
                });
            });

            var inputElm = document.querySelector("#search-parameter");
            tagify = new Tagify(inputElm, {
                originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(',')
            });

            function onChange(e){
                document.querySelector("#search-parameter").value = e.target.value;
            }
            inputElm.addEventListener('change', onChange);
        },


        // Save form data
        save() {
            // Validate form before submission
            this.formData.parameter = document.querySelector("#search-parameter").value;
            if (!this.validateForm()) {
                this.modalText = 'Kérjük, ellenőrizd a megadott adatokat és javítsd a hibákat.';
                this.isModalOpen = true;
                return;
            }
            this.isSubmitting = true;
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
                    this.modalText = 'Hiba történt az adatok elküldése során. Kérjük, próbáld újra később.';
                    this.isModalOpen = true;
                    console.error('Form submission error:', error);
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },

        openManageModal() {
            this.isManageModalOpen = true;
            this.manageEmail = null;
        },

        sendManageLink() {
            if (!this.isValidEmail(this.manageEmail)) {
                this.modalText = 'Kérjük, adj meg egy érvényes e-mail címet.';
                this.isModalOpen = true;
                return;
            }
            this.isSubmitting = true;
            const formData = new URLSearchParams();
            formData.append('email', this.manageEmail);

            fetch(new URL('/api/subscriptions/manage', API_URL), {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.modalText = 'Elküldtük a feliratkozásaidat kezelő linket az e-mail címedre.';
                } else {
                    this.modalText = data.message || 'Hiba történt. Kérjük, próbáld újra később.';
                }
            })
            .catch(() => {
                this.modalText = 'Hiba történt a kérés feldolgozása során. Kérjük, próbáld újra később.';
            })
            .finally(() => {
                this.isSubmitting = false;
                this.isManageModalOpen = false;
                this.isModalOpen = true;
            });
        }
    }));
});
