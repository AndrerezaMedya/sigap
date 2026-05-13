# BMKG

## Data Prakiraan Cuaca Terbuka BMKG

Data prakiraan cuaca seluruh kelurahan dan desa di Indonesia dalam waktu 3 harian. Dalam 1 hari terdapat 8 data prakiraan cuaca (per 3 jam).

Format data: JSON
Jumlah data prakiraan: 3 hari
Jumlah data prakiraan dalam 1 hari: per 3 jam
Pemutakhiran data: 2 kali sehari
Lokasi kelurahan/desa: menggunakan kode wilayah administrasi tingkat IV dapat mengacu pada Keputusan Menteri Dalam Negeri Nomor 100.1.1-6117 Tahun 2022. Contoh: kode wilayah Kelurahan Kemayoran: 31.71.03.1001
Batas akses: 60 permintaan per menit per IP

### Akses API

- $ curl https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv} - $ curl https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001

### Parameter (key)

- utc_datetime: Waktu dalam UTC-YYYY-MM-DD HH:mm:ss
- local_datetime: Waktu lokal-YYYY-MM-DD HH:mm:ss
- t: Suhu Udara dalam °C
- hu: Kelembapan Udara dalam %
- weather_desc: Kondisi Cuaca dalam Indonesia
- weather_desc_en: Kondisi Cuaca dalam English
- ws: Kecepatan Angin dalam km/jam
- wd: Arah Angin dari
- tcc: Tutupan Awan dalam %
- vs_text: Jarak Pandang dalam km
- analysis_date: Waktu produksi data prakiraan cuaca dalam UTC-YYYY-MM-DDTHH:mm:ss

### Mengolah Data JSON

Silakan gunakan kode baris pemrograman untuk mengolah data JSON yang telah tersedia di portal Github BMKG https://github.com/infoBMKG/data-cuaca

## Data Peringatan Dini Cuaca Terbuka BMKG

Data peringatan dini cuaca (nowcast) di seluruh provinsi di Indonesia hingga level kecamatan. Data berbasis Common Alerting Protocol (CAP).

Format data: XML
Standar data: Common Alerting Protocol (CAP)
Validitas data: Terverifikasi valid di CAP Validator
Pemutakhiran data: setiap saat
Daftar data: RSS feed (XML) untuk daftar peringatan dini cuaca skala provinsi aktif di Indonesia
Data detail: CAP (XML) untuk detail wilayah kecamatan terdampak di provinsi tertentu
Bahasa: Tersedia dalam bahasa Indonesia dan English
Rujukan alert: Gunakan dokumen ini untuk arti: urgency, severity, and certainty
Batas akses: 60 permintaan per menit per IP

### Akses API/CAP

- $ curl https://www.bmkg.go.id/alerts/nowcast/id
- $ curl https://www.bmkg.go.id/alerts/nowcast/id/{kode_detail_cap}_alert.xml

### Parameter (key) RSS Feed

- title: Judul peringatan dini cuaca provinsi
- link: Tautan detail CAP tiap provinsi
- description: Deskripsi wilayah terdampak peringatan dini cuaca
- author: Pembuat rilis peringatan dini cuaca
- pubDate: Waktu publikasi lokal (RFC 1123)
- lastBuildDate: Waktu pemutakhiran data UTC (RFC 1123)

### Parameter (key) CAP Nowcast

- event: Jenis kejadian peringatan dini cuaca
- effective: Waktu mulai peringatan dini cuaca (ISO 8601)
- expires: Waktu berakhir peringatan dini cuaca (ISO 8601)
- senderName: Pembuat rilis peringatan dini cuaca
- headline: Judul peringatan dini cuaca provinsi
- description: Deskripsi wilayah peringatan dini cuaca terdampak
- web: Tautan infografik peringatan dini cuaca
- area: Polygon wilayah terdampak peringatan dini cuaca

### Mengolah Data XML CAP

Silakan gunakan kode baris pemrograman untuk mengolah data XML CAP yang telah tersedia di portal Github BMKG https://github.com/infoBMKG/data-cap

---

# VisualCrossing

## Creating a weather API request

### Base URL

https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/

### Endpoints

The possible endpoints of the Timeline Weather API requests are as follows:

/timeline/[location] – forecast queries.
/timeline/[location]/[date1]/[date2] – queries for a specific date range.

### Main Format of the URL

All requests to the Timeline Weather API use the following the form:
https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/[location]/[date1]/[date2]?key=YOUR_API_KEY

### Request Parameters

#### Main Parameters (Path Parameters)

location (required) – is the address, partial address or latitude,longitude location for which to retrieve weather data. You can also use US ZIP Codes. If you would like to submit multiple locations in the same request, consider our Multiple Location Timeline Weather API.

date1 (optional) – is the start date for which to retrieve weather data. If a date2 value is also given, then it represents the first date for which to retrieve weather data. If no date2 is specified then weather data for a single day is retrieved, and that date is specified in date1. All dates and times are in local time of the location specified. Dates should be in the format yyyy-MM-dd. For example 2020-10-19 for October 19th, 2020 or 2017-02-03 for February 3rd, 2017.

Instead of an exact date, you can specify a dynamic date period. See below for more details. You may also supply the in “UNIX time”. In this case provide the number of seconds since 1st January 1970 UTC. For example 1612137600 for Midnight on 1st February 2021.

You can also request the information for a specific time for a single date by including time into the date1 field using the format yyyy-MM-ddTHH:mm:ss. For example 2020-10-19T13:00:00.

The results are returned in the ‘currentConditions’ field and are truncated to the hour requested (i.e. 2020-10-19T13:59:00 will return data at 2020-10-19T13:00:00).

date2 (optional) – is the end date for which to retrieve weather data. This value may only be used when a date1 value is given. When both date1 and date2 values are given, the query is inclusive of date2 and the weather data request period will end on midnight of the date2 value. All dates and times are in local time of the specified location and should be in the format yyyy-MM-dd.

When no date1 or date2 is specified, the request will retrieve the forecast at the requested location for the next 15 days.

---

# PetaBencana

## Ringkasan _Endpoint_

Detail dari setiap endpoint adalah sebagai berikut:

| Endpoint            | Deskripsi                                  | Metode  | Terproteksi |
| ------------------- | ------------------------------------------ | ------- | ----------- |
| /admin              | Batas Administrasi                         | GET     | Tidak       |
| /floodgauges        | <p>Alat Ukur Tinggi</p><p>Muka Air</p>     | GET,PUT | Tidak       |
| /floods             | Genangan Banjir                            | GET     | Sebagian    |
| /floods/archive     | Arsip Genangan Banjir                      | GET     | Tidak       |
| /floods/timeseries  | <p>Time Series </p><p>Genangan Banjir</p>  | GET     | Tidak       |
| /infrastructure     | Infrastruktur                              | GET     | Tidak       |
| /reports            | Laporan Urun-daya                          | GET     | Tidak       |
| /reports/archive    | <p>Arsip Laporan</p><p>Urun-daya</p>       | GET     | Tidak       |
| /reports/timeseries | <p>Time Series Laporan</p><p>Urun-daya</p> | GET     | Tidak       |
| /stats/\*           | Statistik Ringkasan                        | GET     | Tidak       |
