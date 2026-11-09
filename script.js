const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTv90z8MnkAt5sakVxecD2C8a4fFK8_SWgvA0WJVB64ixJjpQObJ9ycl-wfmMSP8YM_GhTc60b9Z5i/pub?gid=0&single=true&output=csv';

fetch(CSV_URL)
    .then(response => response.text())
    .then(csvText => {
        // 1. Parsing CSV
        const rows = csvText.split('\n').map(row => {
            const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
            return row.split(regex).map(cell => cell.replace(/^"|"$/g, '').trim());
        });

        const headers = rows[0].map(h => h.toLowerCase());
        const data = [];

        // 2. Looping data dari baris ke-2
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].length < headers.length) continue; 
            
            let obj = {};
            headers.forEach((header, index) => {
                let value = rows[i][index];
                // Ubah string "|" menjadi array untuk spesifikasi dll
                if (['spesifikasi', 'kondisi', 'kelengkapan'].includes(header)) {
                    value = value ? value.split('|').map(v => v.trim()).filter(v => v) : [];
                }
                obj[header] = value;
            });
            data.push(obj);
        }

        // 3. Render ke tampilan
        renderProducts(data);
    })
    .catch(error => console.error('Error mengambil data CSV:', error));

// Fungsi untuk menampilkan produk
function renderProducts(data) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = ''; 

    // Filter draft & Urutkan
    const filteredData = data
        .filter(p => p.judul && p.visibilitas !== 'draft')
        .sort((a, b) => (parseInt(a.urutan) || 99) - (parseInt(b.urutan) || 99));

    filteredData.forEach(p => {
        // Olah Array Foto
        let fotoArray = [];
        if (p.foto) {
            fotoArray = p.foto.split('|').map(url => {
                return url.includes('id=') 
                    ? `https://wsrv.nl/?url=https://drive.google.com/uc?id=${url.split('id=')[1]}` 
                    : url.trim();
            }).filter(u => u);
        }

        const fotoUtama = fotoArray.length > 0 ? fotoArray[0] : 'https://via.placeholder.com/300x200?text=No+Image';

        // Buat Link untuk Galeri (PhotoSwipe)
                // Buat Link untuk Galeri (Fancybox)
        let galleryLinks = '';
        fotoArray.forEach((f, i) => {
            const displayClass = i === 0 ? 'block' : 'hidden';
            // Tambahkan data-fancybox="gallery" dan data-src
            galleryLinks += `<a href="${f}" data-fancybox="gallery" class="gallery-item ${displayClass} absolute inset-0 w-full h-full overflow-hidden" target="_blank">
                                <img src="${f}" alt="${p.judul}" class="w-full h-full object-contain p-4">
                             </a>`;
        });

        // Susun Kartu HTML
        const card = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden product-card">
                <div class="relative h-64 bg-gray-200 cursor-pointer">
                    ${galleryLinks}
                    <span class="absolute top-3 left-3 ${p.status === 'SOLD' ? 'bg-red-500' : 'bg-green-500'} text-white text-xs font-bold px-2 py-1 rounded z-10">${p.status || 'FORSALE'}</span>
                    ${fotoArray.length > 1 ? `<span class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">+${fotoArray.length - 1} Foto</span>` : ''}
                </div>
                <div class="p-5">
                    <div class="text-xs text-gray-500 mb-1">Kode: ${p.kode}</div>
                    <h3 class="font-bold text-lg text-slate-800 leading-tight mb-2 truncate">${p.judul}</h3>
                    
                    <ul class="text-sm text-gray-600 mb-4 h-16 overflow-hidden">
                        ${(p.spesifikasi || []).slice(0, 3).map(spec => `<li>• ${spec}</li>`).join('')}
                    </ul>

                    <div class="text-xl font-bold text-blue-600 mb-4">${p.harga}</div>
                    
                    <a href="https://wa.me/628561300145?text=Halo%20saya%20tertarik%20dengan%20laptop%20${p.kode}%20-%20${p.judul}" target="_blank" class="block text-center w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition">Beli via WA</a>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}