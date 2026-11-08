// 1. Ambil data dari file JSON
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const grid = document.getElementById('product-grid');
        
        // 2. Loop setiap produk
        data.forEach(product => {
            
            // 3. Buat HTML untuk kartu produk
            const card = `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden product-card">
                    <div class="relative h-48 bg-gray-200">
                        <img src="${product.foto[0]}" alt="${product.judul}" class="w-full h-full object-cover">
                        <span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">${product.status}</span>
                    </div>
                    <div class="p-5">
                        <div class="text-xs text-gray-500 mb-1">Kode: ${product.kode}</div>
                        <h3 class="font-bold text-lg text-slate-800 leading-tight mb-2 truncate">${product.judul}</h3>
                        
                        <!-- Ambil 3 spesifikasi pertama -->
                        <ul class="text-sm text-gray-600 mb-4 h-16 overflow-hidden">
                            ${product.spesifikasi.slice(0, 3).map(spec => `<li>• ${spec}</li>`).join('')}
                        </ul>

                        <div class="text-xl font-bold text-blue-600 mb-4">${product.harga}</div>
                        
                        <!-- Tombol WA dinamis -->
                        <a href="https://wa.me/628561300145?text=Halo%20saya%20tertarik%20dengan%20laptop%20${product.kode}%20-%20${product.judul}" target="_blank" class="block text-center w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition">Beli via WA</a>
                    </div>
                </div>
            `;
            
            // 4. Masukkan ke dalam grid
            grid.innerHTML += card;
        });
    })
    .catch(error => console.error('Error mengambil data:', error));