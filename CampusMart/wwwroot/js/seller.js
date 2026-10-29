// Seller page JS
document.addEventListener('DOMContentLoaded', function () {
    // Section toggling via sidebar
    const navItems = document.querySelectorAll('#sidebarNav .nav-item[data-target]');
    const sections = {};
    navItems.forEach(item => {
        const id = item.getAttribute('data-target');
        if (id) sections[id] = document.getElementById(id);
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('#sidebarNav .nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            if (targetId && sections[targetId]) {
                Object.values(sections).forEach(sec => { if (sec) sec.style.display = 'none'; });
                sections[targetId].style.display = 'block';
            }
        });
    });

    // Upload zone drag & drop
    const uploadZone = document.querySelector('.upload-zone');
    const fileInput = document.getElementById('listingImages');
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                previewImages(e.dataTransfer.files);
            }
        });
        fileInput.addEventListener('change', function () { previewImages(this.files); });
    }

    function previewImages(files) {
        let container = document.querySelector('.upload-previews');
        if (!container) {
            container = document.createElement('div');
            container.className = 'upload-previews';
            uploadZone.appendChild(container);
        }
        container.innerHTML = '';
        Array.from(files).slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                container.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
});
