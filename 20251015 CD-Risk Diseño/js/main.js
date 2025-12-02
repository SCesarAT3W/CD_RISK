// Function to format results with image
function formatState (state) {
    if (!state.id) {
        return state.text;
    }
    // Check if data-img-src exists, if not, just return the text
    if (!state.element || !state.element.dataset.imgSrc) {
        return state.text;
    }
    var $state = $(
        '<span><img src="' + state.element.dataset.imgSrc + '" class="img-flag" /> ' + state.text + '</span>'
    );
    return $state;
};

// Function to initialize Select2 for all elements with the class 'select-with-images'
function initializeImageSelect2s() {
    // Select all elements with the class 'select-with-images'
    const selectsToInitialize = $('.select-with-images');
    
    selectsToInitialize.each(function() {
        const currentSelect = $(this);
        // Check if the element exists and if Select2 has not been initialized yet
        if (currentSelect.length && !currentSelect.hasClass('select2-hidden-accessible')) {
            currentSelect.select2({
                templateResult: formatState,
                templateSelection: formatState,
                minimumResultsForSearch: Infinity // Hides the search box
            });
        }
    });
}

// Use a MutationObserver to detect when the #wizard-content changes
const wizardContent = document.getElementById('wizard-content');
if (wizardContent) {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            // Check for changes in child elements of wizardContent
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Re-run the initialization for all image selects
                initializeImageSelect2s();
                break; 
            }
        }
    });

    // Start observing the target node for configured mutations
    // Observe changes to direct children and descendants of wizardContent
    observer.observe(wizardContent, { childList: true, subtree: true });

    // Also call on initial load if protection_scheme_map.html is the first loaded step
    // This is for cases where the element might be present on initial DOMContentLoaded
    initializeImageSelect2s();

} else {
    console.warn("Element with id 'wizard-content' not found. Select2 initialization might not work as expected.");
}

console.log('Aplicación web cargada.'); // Keep existing log