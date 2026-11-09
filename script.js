const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTv90z8MnkAt5sakVxecD2C8a4fFK8_SWgvA0WJVB64ixJjpQObJ9ycl-wfmMSP8YM_GhTc60b9Z5i/pub?gid=0&single=true&output=csv';

fetch(CSV_URL)
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n').map(row => {
            const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
            return row.split(regex).map(cell => cell.replace(/^"|"$/g, '').trim());
        });

        const headers = rows[0].map(h => h.toLowerCase());
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            if (rows[i].length < headers.length) continue; 
            let obj = {};
            headers.forEach((header, index) => {
                let value = rows[i][index];
                if (['spesifikasi', 'kondisi', 'kelengkapan'].includes(header)) {
                    value = value ? value.split('|').map(v => v.trim()).filter(v => v) : [];
                }
                obj[header] = value;
            });
            data.push(obj);
        }
        renderProducts(data);
    })
    .catch(error => console.error('Error mengambil data CSV:', error));

function renderProducts(data) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = ''; 

    const filteredData = data
        .filter(p => p.judul && p.visibilitas !== 'draft')
        .sort((a, b) => (parseInt(a.urutan) || 99) - (parseInt(b.urutan) || 99));

    filteredData.forEach((p) => {
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

        // Logika 3 Spesifikasi Utama
        const specs = p.spesifikasi || [];
        let proc = specs.find(s => s.toLowerCase().includes('processor') || s.toLowerCase().includes('cpu')) || '';
        let ram = specs.find(s => s.toLowerCase().includes('ram')) || '';
        let ssd = specs.find(s => s.toLowerCase().includes('ssd') || s.toLowerCase().includes('storage') || s.toLowerCase().includes('hdd')) || '';
        
        if (!proc && !ram && !ssd) {
            proc = specs[0] || ''; ram = specs[1] || ''; ssd = specs[2] || '';
        }
        const cleanText = (text) => text.replace(/^-/, '').trim();
        const waLink = `https://wa.me/628561300145?text=Halo%20saya%20tertarik%20dengan%20laptop%20${p.kode}%20-%20${p.judul}`;

        // ID unik untuk popup detail
        const detailId = `detail-${p.kode.replace(/\s+/g, '')}`;

        // --- HTML POPUP DETAIL (Isi lengkap + Galeri Foto) ---
        const detailHTML = `
            <div class="p-6 bg-white rounded-lg max-w-3xl mx-auto text-left" style="font-family: 'Poppins', sans-serif;">
                <div class="flex flex-col md:flex-row gap-6">
                    
                    <!-- KOLOM KIRI: FOTO -->
                    <div class="md:w-1/2">
                        <!-- Foto Utama (Bisa diklik untuk zoom) -->
                        <a href="${fotoUtama}" data-fancybox="galeri-${p.kode}" class="block mb-4">
                            <img src="${fotoUtama}" class="w-full rounded-lg object-contain h-64 bg-gray-100 border">
                        </a>
                        
                        <!-- Thumbnail Foto Lainnya (Bisa diklik untuk zoom) -->
                        <div class="grid grid-cols-4 gap-2">
                            ${fotoArray.map((f, idx) => `
                                <a href="${f}" data-fancybox="galeri-${p.kode}" class="block cursor-pointer">
                                    <img src="${f}" class="w-full h-16 object-cover rounded border hover:border-blue-500 transition ${idx === 0 ? 'opacity-50' : ''}">
                                </a>
                            `).join('')}
                        </div>
                    </div>

                    <!-- KOLOM KANAN: SPESIFIKASI -->
                    <div class="md:w-1/2">
                        <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">${p.status || 'FORSALE'}</span>
                        <h2 class="text-2xl font-bold mt-2 mb-1 leading-snug">${p.judul}</h2>
                        <p class="text-gray-500 text-sm mb-4">Kode: ${p.kode} | Lokasi: ${p.lokasi}</p>
                        <div class="text-3xl font-bold text-blue-600 mb-6">${p.harga}</div>
                        
                        <h3 class="font-bold border-b pb-1 mb-2 text-sm text-gray-800">Spesifikasi Lengkap</h3>
                        <ul class="text-sm text-gray-600 mb-4 space-y-1">
                            ${specs.map(s => `<li>• ${cleanText(s)}</li>`).join('')}
                        </ul>

                        <h3 class="font-bold border-b pb-1 mb-2 text-sm text-gray-800">Kondisi & Kelengkapan</h3>
                        <ul class="text-sm text-gray-600 mb-6 space-y-1">
                            ${(p.kondisi || []).map(s => `<li>• ${cleanText(s)}</li>`).join('')}
                            ${(p.kelengkapan || []).map(s => `<li>• ${cleanText(s)}</li>`).join('')}
                        </ul>

                        <a href="${waLink}" target="_blank" class="block text-center w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Beli via WhatsApp</a>
                    </div>
                </div>
            </div>
        `;

        // --- HTML KARTU PRODUK ---
        const card = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                
                <!-- Area Gambar: Klik untuk buka detail -->
                <a href="javascript:;" data-fancybox="detail" data-src="#${detailId}" class="relative h-48 bg-gray-200 cursor-pointer group block">
                    <img src="${fotoUtama}" alt="${p.judul}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span class="text-white font-bold border-2 border-white px-4 py-2 rounded">Lihat Detail</span>
                    </div>
                    <span class="absolute top-3 left-3 ${p.status === 'SOLD' ? 'bg-red-500' : 'bg-green-500'} text-white text-xs font-bold px-2 py-1 rounded z-10">${p.status || 'FORSALE'}</span>
                    ${fotoArray.length > 1 ? `<span class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">+${fotoArray.length - 1} Foto</span>` : ''}
                </a>
                
                <div class="p-5 flex-1 flex flex-col">
                    <div class="text-xs text-gray-500 mb-1">Kode: ${p.kode}</div>
                    
                    <!-- Judul: Tanpa truncate, pakai line-clamp-2 agar maksimal 2 baris -->
                    <h3 class="font-bold text-lg text-slate-800 leading-tight mb-3 line-clamp-2">${p.judul}</h3>
                    
                    <!-- Spesifikasi: Wrap text, tanpa titik-titik -->
                    <ul class="text-sm text-gray-600 mb-4 flex-1 space-y-1">
                        ${proc ? `<li>• ${cleanText(proc)}</li>` : ''}
                        ${ram ? `<li>• ${cleanText(ram)}</li>` : ''}
                        ${ssd ? `<li>• ${cleanText(ssd)}</li>` : ''}
                    </ul>

                    <div class="text-xl font-bold text-blue-600 mb-4">${p.harga}</div>
                    
                    <div class="flex gap-2">
                        <a href="${waLink}" target="_blank" class="flex-1 text-center bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition text-sm">Beli WA</a>
                        <a href="javascript:;" data-fancybox="detail" data-src="#${detailId}" class="flex-1 text-center bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg font-medium hover:bg-blue-100 transition text-sm">Detail</a>
                    </div>
                </div>
            </div>

            <!-- Konten Tersembunyi untuk Popup Detail -->
            <div style="display: none;" id="${detailId}">
                ${detailHTML}
            </div>
        `;
        grid.innerHTML += card;
    });
}