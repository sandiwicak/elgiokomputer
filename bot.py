import telebot
import json
import os

# GANTI DENGAN TOKEN DARI BOTFATHER ANDA
TOKEN = '9206469513:AAFfIXAb3qtJWHmroxt0rgHGT48WRvitSlE'
bot = telebot.TeleBot(TOKEN)

DATA_FILE = 'data.json'

# Fungsi untuk membaca data.json
def baca_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# Fungsi untuk menyimpan ke data.json
def simpan_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Perintah /start
@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    panduan = (
        "Halo Admin Elgio Komputer! 👋\n\n"
        "Kirim data laptop baru dengan format berikut:\n\n"
        "Kode : IJ0621\n"
        "Harga : Rp 3.400.000\n"
        "Judul : Laptop Dell Vostro 3481\n"
        "Spesifikasi : -Proc Intel i3\n-RAM 4GB\n-SSD 256GB\n"
        "Kondisi : -Mulus\n-Batre Normal\n"
        "Kelengkapan : -Unit\n-Charger\n"
        "Lokasi : Ciledug\n"
        "Foto : https://linkfoto1.com, https://linkfoto2.com\n\n"
        "Pastikan tanda titik dua (:) ada ya!"
    )
    bot.reply_to(message, panduan)

# Handler untuk menerima teks (produk baru)
@bot.message_handler(func=lambda message: True)
def handle_new_product(message):
    text = message.text
    
    # Cek apakah formatnya benar (ada kata Kode : dan Judul :)
    if "Kode :" not in text or "Judul :" not in text:
        bot.reply_to(message, "❌ Format salah. Ketik /start untuk melihat contoh format.")
        return

    try:
        # Memecah teks berdasarkan baris baru
        lines = text.split('\n')
        
        produk = {
            "kode": "", "harga": "", "judul": "", "status": "FORSALE",
            "spesifikasi": [], "kondisi": [], "kelengkapan": [], "lokasi": "", "foto": []
        }

        current_key = None
        for line in lines:
            line = line.strip()
            if not line: continue

            # Jika baris mengandung titik dua (:)
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower()
                value = value.strip()

                if key == 'kode': produk['kode'] = value
                elif key == 'harga': produk['harga'] = value
                elif key == 'judul': produk['judul'] = value
                elif key == 'lokasi': produk['lokasi'] = value
                elif key == 'foto': 
                    produk['foto'] = [url.strip() for url in value.split(',')]
                elif key in ['spesifikasi', 'kondisi', 'kelengkapan']:
                    # Jika ada isi di baris yang sama (misal: Spesifikasi : -Proc i3)
                    if value: 
                        produk[key].append(value.replace('-', '').strip())
                    current_key = key
            else:
                # Jika baris tidak ada titik dua, itu adalah lanjutan list (misal: -RAM 4GB)
                if current_key and line.startswith('-'):
                    produk[current_key].append(line.replace('-', '').strip())

        # Simpan ke data.json
        data_lama = baca_data()
        
        # Cek apakah kode sudah ada (biar tidak duplikat)
        if any(d['kode'] == produk['kode'] for d in data_lama):
            bot.reply_to(message, f"⚠️ Produk dengan kode {produk['kode']} sudah ada!")
            return

        data_lama.append(produk)
        simpan_data(data_lama)

        bot.reply_to(message, f"✅ Berhasil! Laptop {produk['judul']} (Kode: {produk['kode']}) telah ditambahkan ke website.")

    except Exception as e:
        bot.reply_to(message, f"❌ Terjadi kesalahan saat memproses data: {str(e)}")

print("Bot sedang berjalan... Tekan Ctrl+C untuk berhenti.")
bot.infinity_polling()