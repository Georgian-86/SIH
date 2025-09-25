// Client-side JavaScript for general UI interactions
document.addEventListener('DOMContentLoaded', () => {
    console.log('Ayush FHIR Microservice UI loaded.');

    // Highlight active navigation link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath ||
            (currentPath === '/' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        } else if (currentPath.startsWith('/static/') && link.getAttribute('href') === currentPath.replace('/static', '')) {
            // Handle cases where /static/index.html should activate /
            link.classList.add('active');
        }
    });

    // --- Search Functionality ---
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');

    if (searchButton && searchInput && searchResultsDiv) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            searchResultsDiv.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        searchResultsDiv.innerHTML = '<p>Searching...</p>';

        try {
            const response = await fetch(`/api/terminology/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                displaySearchResults(data.results);
            } else {
                searchResultsDiv.innerHTML = `<p>Error: ${data.message || 'Failed to fetch search results.'}</p>`;
            }
        } catch (error) {
            console.error('Search error:', error);
            searchResultsDiv.innerHTML = `<p>An unexpected error occurred: ${error.message}</p>`;
        }
    }

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResultsDiv.innerHTML = '<p>No results found.</p>';
            return;
        }

        const ul = document.createElement('ul');
        results.forEach(term => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${term.term_label}</strong> (${term.category}) - ID: ${term.term_id}
                ${term.icd11_tm2_code ? `(ICD-11 TM2: ${term.icd11_tm2_code})` : ''}
                <p>${term.description || 'No description available.'}</p>
            `;
            ul.appendChild(li);
        });
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.appendChild(ul);
    }

    // --- Ingest Functionality ---
    const ingestForm = document.getElementById('ingestForm');
    const csvFileInput = document.getElementById('csvFile');
    const ingestOutput = document.getElementById('ingestOutput');
    const ingestResultsContainer = document.getElementById('ingestResults');

    if (ingestForm && csvFileInput && ingestOutput && ingestResultsContainer) {
        ingestForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const file = csvFileInput.files[0];
            if (!file) {
                ingestOutput.textContent = 'Please select a CSV file.';
                ingestResultsContainer.style.display = 'block';
                return;
            }

            ingestOutput.textContent = 'Uploading and ingesting...';
            ingestResultsContainer.style.display = 'block';

            const formData = new FormData();
            formData.append('csvFile', file);

            try {
                const response = await fetch('/admin/ingest-csv', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (response.ok) {
                    ingestOutput.textContent = `Ingestion successful: ${data.message}`;
                } else {
                    ingestOutput.textContent = `Error: ${data.message || 'Ingestion failed.'}`;
                }
            } catch (error) {
                console.error('Error during ingestion:', error);
                ingestOutput.textContent = 'Error performing ingestion. Please try again.';
            }
        });
    }

    // --- FHIR Operations Functionality ---
    const ingestFhirBundleForm = document.getElementById('ingestFhirBundleForm');
    const fhirBundleFileInput = document.getElementById('fhirBundleFile');
    const ingestBundleOutput = document.getElementById('ingestBundleOutput');
    const ingestBundleResultsContainer = document.getElementById('ingestBundleResults');

    const generateCodeSystemBtn = document.getElementById('generateCodeSystemBtn');
    const codeSystemOutput = document.getElementById('codeSystemOutput');
    const codeSystemResultsContainer = document.getElementById('codeSystemResults');

    const generateConceptMapBtn = document.getElementById('generateConceptMapBtn');
    const conceptMapOutput = document.getElementById('conceptMapOutput');
    const conceptMapResultsContainer = document.getElementById('conceptMapResults');

    if (ingestFhirBundleForm && fhirBundleFileInput && ingestBundleOutput && ingestBundleResultsContainer) {
        ingestFhirBundleForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const file = fhirBundleFileInput.files[0];
            if (!file) {
                ingestBundleOutput.textContent = 'Please select a FHIR Bundle JSON file.';
                ingestBundleResultsContainer.style.display = 'block';
                return;
            }

            ingestBundleOutput.textContent = 'Uploading and ingesting Bundle...';
            ingestBundleResultsContainer.style.display = 'block';

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const bundleContent = JSON.parse(e.target.result);
                    const response = await fetch('/api/fhir/bundle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bundleContent)
                    });
                    const data = await response.json();

                    if (response.ok) {
                        ingestBundleOutput.textContent = `Bundle Ingestion successful: ${data.message}`;
                    } else {
                        ingestBundleOutput.textContent = `Error: ${data.message || 'Bundle ingestion failed.'}`;
                    }
                } catch (error) {
                    console.error('Error during FHIR Bundle ingestion:', error);
                    ingestBundleOutput.textContent = 'Error processing FHIR Bundle. Please ensure it is valid JSON.';
                }
            };
            reader.readAsText(file);
        });
    }

    if (generateCodeSystemBtn && codeSystemOutput && codeSystemResultsContainer) {
        generateCodeSystemBtn.addEventListener('click', async () => {
            codeSystemOutput.textContent = 'Generating CodeSystem...';
            codeSystemResultsContainer.style.display = 'block';

            try {
                const response = await fetch('/api/fhir/codesystem');
                const data = await response.json();

                if (response.ok) {
                    codeSystemOutput.textContent = JSON.stringify(data, null, 2);
                } else {
                    codeSystemOutput.textContent = `Error: ${data.message || 'Failed to generate CodeSystem.'}`;
                }
            } catch (error) {
                console.error('Error generating CodeSystem:', error);
                codeSystemOutput.textContent = 'Error generating CodeSystem. Please try again.';
            }
        });
    }

    if (generateConceptMapBtn && conceptMapOutput && conceptMapResultsContainer) {
        generateConceptMapBtn.addEventListener('click', async () => {
            conceptMapOutput.textContent = 'Generating ConceptMap...';
            conceptMapResultsContainer.style.display = 'block';

            try {
                const response = await fetch('/api/fhir/conceptmap');
                const data = await response.json();

                if (response.ok) {
                    conceptMapOutput.textContent = JSON.stringify(data, null, 2);
                } else {
                    conceptMapOutput.textContent = `Error: ${data.message || 'Failed to generate ConceptMap.'}`;
                }
            } catch (error) {
                console.error('Error generating ConceptMap:', error);
                conceptMapOutput.textContent = 'Error generating ConceptMap. Please try again.';
            }
        });
    }

    // --- Translation Functionality ---
    const translateForm = document.getElementById('translateForm');
    const translateCodeInput = document.getElementById('translateCode');
    const translationOutput = document.getElementById('translationOutput');
    const translationResultsContainer = document.getElementById('translationResults');

    if (translateForm && translateCodeInput && translationOutput && translationResultsContainer) {
        translateForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const code = translateCodeInput.value.trim();
            if (!code) {
                translationOutput.textContent = 'Please enter a code to translate.';
                translationResultsContainer.style.display = 'block';
                return;
            }

            translationOutput.textContent = 'Translating...';
            translationResultsContainer.style.display = 'block';

            try {
                const response = await fetch(`/api/terminology/translate?code=${encodeURIComponent(code)}`);
                const data = await response.json();

                if (response.ok) {
                    translationOutput.textContent = JSON.stringify(data, null, 2);
                } else {
                    translationOutput.textContent = `Error: ${data.message || 'Translation failed.'}`;
                }
            } catch (error) {
                console.error('Error during translation:', error);
                translationOutput.textContent = 'Error performing translation. Please try again.';
            }
        });
    }
});
