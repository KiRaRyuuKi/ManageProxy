document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const selectedProtocol = document.getElementById('selected-protocol');
    const connectBtn = document.getElementById('connect-btn');
    const logBtn = document.getElementById('log-btn');
    const clearLogBtn = document.getElementById('clear-log-btn');
    const closeLogBtn = document.getElementById('close-log-btn');
    const logPanel = document.getElementById('log-panel');
    const logContent = document.getElementById('log-content');
    const proxyFrame = document.getElementById('proxy-frame');
    const placeholder = document.getElementById('placeholder');
    const loadingIndicator = document.getElementById('loading-indicator');
    const addressInput = document.getElementById('address');
    const portInput = document.getElementById('port');

    // Hide log panel initially
    logPanel.style.display = 'block';

    // Protocol dropdown functionality
    dropdownBtn.addEventListener('click', function (e) {
        e.preventDefault();
        dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!dropdownBtn.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Protocol selection
    const protocolOptions = dropdownMenu.querySelectorAll('div[data-value]');
    protocolOptions.forEach(option => {
        option.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            const name = this.getAttribute('data-name');

            // Update the selected protocol display
            selectedProtocol.textContent = name;

            // Update the checkmark
            protocolOptions.forEach(opt => {
                // Remove all checkmarks
                const checkmark = opt.querySelector('svg');
                if (checkmark) {
                    checkmark.style.display = opt === this ? 'block' : 'none';
                }
            });

            dropdownMenu.classList.add('hidden');
        });
    });

    // Connect button functionality
    document.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();

        const protocol = selectedProtocol.textContent.toLowerCase();
        const address = addressInput.value.trim();
        const port = portInput.value.trim();

        if (!address || !port) {
            addLogEntry('Error: Address dan Port harus diisi', 'error');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        placeholder.style.display = 'none';
        proxyFrame.classList.remove('hidden');

        // Create URL
        const proxyUrl = `/proxy?protocol=${protocol}&address=${encodeURIComponent(address)}&port=${encodeURIComponent(port)}`;

        // Log connection attempt
        addLogEntry(`Mencoba koneksi ${protocol}://${address}:${port}`, 'info');

        // Set iframe src
        proxyFrame.src = proxyUrl;

        // Listen for load/error events
        proxyFrame.onload = function () {
            loadingIndicator.classList.add('hidden');
            addLogEntry(`Koneksi berhasil: ${protocol}://${address}:${port}`, 'success');
        };

        proxyFrame.onerror = function () {
            loadingIndicator.classList.add('hidden');
            placeholder.style.display = 'flex';
            proxyFrame.classList.add('hidden');
            addLogEntry(`Koneksi gagal: ${protocol}://${address}:${port}`, 'error');
        };
    });

    // Log button functionality
    logBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logPanel.style.display = 'block';
    });

    // Close log panel
    closeLogBtn.addEventListener('click', function () {
        logPanel.style.display = 'none';
    });

    // Clear log
    clearLogBtn.addEventListener('click', function () {
        logContent.innerHTML = '<div class="text-gray-400 text-xs italic"></div>';
    });

    // Add log entry
    function addLogEntry(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.classList.add('mb-1', 'pb-1', 'border-b', 'border-gray-100');

        let icon = '';
        let color = '';

        switch (type) {
            case 'error':
                icon = '<span class="text-red-500">✖</span>';
                color = 'text-red-600';
                break;
            case 'success':
                icon = '<span class="text-green-500">✓</span>';
                color = 'text-green-600';
                break;
            case 'info':
            default:
                icon = '<span class="pl-0.5 pr-1 text-blue-500">ℹ</span>';
                color = 'text-gray-700';
                break;
        }

        entry.innerHTML = `
            <div class="flex items-start">
                <div class="mr-1.5">${icon}</div>
                <div>
                    <div class="text-xs text-gray-400">${timestamp}</div>
                    <div class="${color} text-xs">${message}</div>
                </div>
            </div>
        `;

        logContent.prepend(entry);

        // Show log panel on error
        if (type === 'error') {
            logPanel.style.display = 'block';
        }
    }

    // Initialize with a welcome log
    addLogEntry('Sistem proxy siap. Masukkan alamat dan port untuk memulai.', 'info');
});