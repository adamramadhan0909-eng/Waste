    const reportConfig = {
      volumeLevels: {
        sedikit: { label: 'Sedikit', score: 1 },
        sedang: { label: 'Sedang', score: 2 },
        banyak: { label: 'Banyak', score: 3 },
      },
      riskLevels: {
        'Tidak mengganggu': { label: 'Tidak mengganggu', score: 0 },
        'Mengganggu jalan': { label: 'Mengganggu jalan', score: 1 },
        'Menyumbat drainase': { label: 'Menyumbat drainase', score: 1 },
        'Bau menyengat': { label: 'Bau menyengat', score: 1 },
        Berbahaya: { label: 'Berbahaya', score: 1 },
      },
      statusLevels: {
        green: { label: 'Aman/Terkendali', className: 'green', progress: 34 },
        yellow: { label: 'Perlu Perhatian', className: 'yellow', progress: 67 },
        red: { label: 'Prioritas Tinggi', className: 'red', progress: 100 },
      },
      mapCenter: { lat: -6.1754, lng: 106.8272 },
      mapRange: { lat: 0.08, lng: 0.12 },
    };

    const rewardConfig = {
      pointsPerReport: 1,
      sheetName: 'Reward Pelapor',
      fileName: 'reward_collectwaste.xlsx',
    };

    const svgIcon = {
      report: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9" opacity=".15"/></svg>`,
      recap: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 18h14"/><path d="M7 14v4M12 10v8M17 6v12"/></svg>`,
      news: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/></svg>`,
      edu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6l8 4-8 4-8-4 8-4z"/><path d="M4 10v6l8 4 8-4v-6"/></svg>`,
      total: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16v16H4z"/><path d="M8 12h8M12 8v8"/></svg>`,
      green: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m5 13 4 4L19 7"/></svg>`,
      yellow: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v4"/><path d="M12 16h.01"/><path d="M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>`,
      red: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 9-6 6"/><path d="m9 9 6 6"/><circle cx="12" cy="12" r="9"/></svg>`,
      area: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>`
    };

    function formatInputValue(date) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    }

    function createRelativeDate(daysAgo, hours, minutes) {
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      return date;
    }

    function createSampleReport({
      id,
      daysAgo,
      hours,
      minutes,
      incidentLeadHours = 0,
      namaArea = '',
      patokan,
      lat,
      lng,
      mapX,
      mapY,
      volume,
      jenisSampah,
      dampak,
      deskripsi,
      dokumentasi,
      pelaporNama = '',
      pelaporKontak = '',
    }) {
      const reportedAt = createRelativeDate(daysAgo, hours, minutes);
      const incidentAt = incidentLeadHours
        ? new Date(reportedAt.getTime() - incidentLeadHours * 60 * 60 * 1000)
        : null;

      return buildReportRecord({
        id,
        reportedAt: reportedAt.toISOString(),
        waktuKejadian: incidentAt ? incidentAt.toISOString() : '',
        namaArea,
        patokan,
        koordinat: { lat, lng, mapX, mapY },
        volume,
        jenisSampah,
        dampak,
        deskripsi,
        dokumentasi,
        pelaporNama,
        pelaporKontak,
        mapPoint: { x: mapX, y: mapY },
      });
    }

    const locationCatalog = {
      receiving: 'Area Receiving',
      loadingDock: 'Loading Dock',
      storage: 'Area Penyimpanan',
      packing: 'Area Packing/Repacking',
      corridor: 'Koridor Operasional',
      pantry: 'Pantry Karyawan',
      office: 'Kantor Operasional',
      parking: 'Parkir Kendaraan Operasional',
      tps: 'TPS Internal',
      outer: 'Area Luar/Belakang Gudang',
    };

    const facilityReferencePoints = [
      { number: 1, name: locationCatalog.receiving, points: [{ x: 11, y: 25 }] },
      { number: 2, name: locationCatalog.loadingDock, points: [{ x: 16, y: 39 }, { x: 75, y: 49 }] },
      { number: 3, name: locationCatalog.storage, points: [{ x: 48, y: 25 }] },
      { number: 4, name: locationCatalog.packing, points: [{ x: 69, y: 29 }, { x: 68, y: 56 }] },
      { number: 5, name: locationCatalog.corridor, points: [{ x: 39, y: 50 }] },
      { number: 6, name: locationCatalog.pantry, points: [{ x: 78, y: 12 }] },
      { number: 7, name: locationCatalog.office, points: [{ x: 23, y: 61 }, { x: 75, y: 79 }] },
      { number: 8, name: locationCatalog.parking, points: [{ x: 44, y: 80 }] },
      { number: 9, name: locationCatalog.tps, points: [{ x: 11, y: 58 }, { x: 86, y: 12 }] },
      { number: 10, name: locationCatalog.outer, points: [{ x: 94, y: 72 }, { x: 4, y: 78 }] },
    ];

    const appState = {
      activePage: 'home',
      selectedCondition: '',
      selectedCoordinates: null,
      reportPhotos: [],
      lastSubmittedReport: null,
      newsCategory: 'Semua',
      educationCategory: 'Semua',
      recapSearch: '',
      recapDateFilter: 'all',
      recapStatusFilter: 'all',
      recapWasteFilter: 'all',
      recapSort: 'latest-desc',
      newsSearch: '',
      educationSearch: '',
      reports: [
        createSampleReport({
          id: 'R-001',
          daysAgo: 3,
          hours: 7,
          minutes: 30,
          incidentLeadHours: 2,
          namaArea: locationCatalog.receiving,
          patokan: 'Dekat meja pemeriksaan barang masuk',
          lat: -6.1761,
          lng: 106.8242,
          mapX: 11,
          mapY: 25,
          volume: 'banyak',
          jenisSampah: 'Campuran',
          dampak: 'Mengganggu jalan',
          deskripsi: 'Tumpukan sampah campuran terlihat di area receiving dan mulai mengganggu alur pemeriksaan barang masuk.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Rina',
          pelaporKontak: '081233445566',
        }),
        createSampleReport({
          id: 'R-002',
          daysAgo: 2,
          hours: 9,
          minutes: 10,
          namaArea: locationCatalog.loadingDock,
          patokan: 'Sisi kiri pintu bongkar muat 2',
          lat: -6.1808,
          lng: 106.8334,
          mapX: 16,
          mapY: 39,
          volume: 'banyak',
          jenisSampah: 'Plastik',
          dampak: 'Menyumbat drainase',
          deskripsi: 'Sampah plastik menumpuk di loading dock dan berpotensi mengganggu proses bongkar muat.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Budi',
          pelaporKontak: '081233445567',
        }),
        createSampleReport({
          id: 'R-003',
          daysAgo: 2,
          hours: 17,
          minutes: 45,
          namaArea: locationCatalog.storage,
          patokan: 'Lorong rak blok B bagian utara',
          lat: -6.1714,
          lng: 106.8388,
          mapX: 48,
          mapY: 25,
          volume: 'sedang',
          jenisSampah: 'Campuran',
          dampak: 'Mengganggu jalan',
          deskripsi: 'Sampah campuran terlihat di area penyimpanan dan mulai mengganggu akses troli operasional.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Sari',
          pelaporKontak: '081233445568',
        }),
        createSampleReport({
          id: 'R-004',
          daysAgo: 1,
          hours: 8,
          minutes: 5,
          namaArea: locationCatalog.packing,
          patokan: 'Dekat meja repacking sisi timur',
          lat: -6.1682,
          lng: 106.8206,
          mapX: 75,
          mapY: 79,
          volume: 'sedikit',
          jenisSampah: 'Plastik',
          dampak: 'Tidak mengganggu',
          deskripsi: 'Botol dan kemasan bekas tercecer di area packing/repacking.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1527847263472-aa5338d178b8?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Andi',
          pelaporKontak: '081233445569',
        }),
        createSampleReport({
          id: 'R-005',
          daysAgo: 1,
          hours: 14,
          minutes: 20,
          namaArea: locationCatalog.corridor,
          patokan: 'Koridor antara penyimpanan dan loading dock',
          lat: -6.1824,
          lng: 106.8179,
          mapX: 39,
          mapY: 50,
          volume: 'sedang',
          jenisSampah: 'Organik',
          dampak: 'Bau menyengat',
          deskripsi: 'Sampah organik menumpuk di koridor operasional dan mulai menimbulkan bau.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Andi',
          pelaporKontak: '081233445569',
        }),
        createSampleReport({
          id: 'R-006',
          daysAgo: 0,
          hours: 6,
          minutes: 40,
          namaArea: locationCatalog.pantry,
          patokan: 'Dekat wastafel pantry',
          lat: -6.1739,
          lng: 106.8128,
          mapX: 68,
          mapY: 56,
          volume: 'sedang',
          jenisSampah: 'Campuran',
          dampak: 'Bau menyengat',
          deskripsi: 'Tempat sampah pantry penuh dan sebagian sampah ringan keluar ke area sirkulasi karyawan.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Rina',
          pelaporKontak: '081233445566',
        }),
        createSampleReport({
          id: 'R-007',
          daysAgo: 0,
          hours: 10,
          minutes: 5,
          namaArea: locationCatalog.tps,
          patokan: 'Samping kontainer residu',
          lat: -6.1774,
          lng: 106.8254,
          mapX: 11,
          mapY: 58,
          volume: 'banyak',
          jenisSampah: 'Campuran',
          dampak: 'Bau menyengat',
          deskripsi: 'Sampah campuran masih menumpuk di TPS internal dan aroma mulai menyebar ke area sekitar.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Budi',
          pelaporKontak: '081233445567',
        }),
        createSampleReport({
          id: 'R-008',
          daysAgo: 0,
          hours: 15,
          minutes: 30,
          namaArea: locationCatalog.outer,
          patokan: 'Sisi barat pagar belakang gudang',
          lat: -6.1667,
          lng: 106.8424,
          mapX: 86,
          mapY: 13,
          volume: 'sedikit',
          jenisSampah: 'B3',
          dampak: 'Berbahaya',
          deskripsi: 'Terlihat beberapa pecahan kaca dan limbah kecil di area luar belakang gudang.',
          dokumentasi: [
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
          ],
          pelaporNama: 'Dita',
          pelaporKontak: '081233445570',
        }),
      ],
      news: [
        {
          id: 'N-001',
          title: 'Program bank sampah digital diterapkan di kawasan padat penduduk',
          summary: 'Digitalisasi bank sampah mendukung pemetaan volume sampah rumah tangga dan partisipasi dalam pemilahan.',
          image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80',
          date: '2025-02-20',
          category: 'Inovasi',
          content: 'Inisiatif ini mendukung pengumpulan data yang lebih akurat serta pemberian insentif bagi warga yang melakukan pemilahan dari sumber.',
        },
        {
          id: 'N-002',
          title: 'Komunitas lokal membersihkan aliran sungai bersama relawan',
          summary: 'Kegiatan pembersihan sungai membantu mengurangi penyumbatan dan meningkatkan kepedulian lingkungan.',
          image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
          date: '2025-02-18',
          category: 'Komunitas',
          content: 'Kegiatan ini juga menjadi sarana edukasi mengenai dampak sampah terhadap kualitas air.',
        },
        {
          id: 'N-003',
          title: 'Data pelaporan warga digunakan untuk mengidentifikasi titik sampah musiman',
          summary: 'Data laporan membantu otoritas setempat mengenali area berulang yang memerlukan penanganan lebih awal.',
          image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
          date: '2025-02-15',
          category: 'Data',
          content: 'Tren pelaporan yang konsisten membantu penetapan prioritas pada wilayah yang rawan sebelum kondisi memburuk.',
        },
        {
          id: 'N-004',
          title: 'Sekolah mengintegrasikan edukasi pengurangan sampah dalam kegiatan harian',
          summary: 'Kebiasaan membawa wadah sendiri dan memilah sampah mendukung pengurangan volume sampah campuran.',
          image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
          date: '2025-02-12',
          category: 'Edukasi',
          content: 'Sekolah menjadi simpul penting untuk menanamkan perilaku pengelolaan sampah yang lebih bertanggung jawab.',
        },
        {
          id: 'N-005',
          title: 'Pasar tradisional menguji area pemilahan sampah organik dan anorganik',
          summary: 'Uji coba dilakukan untuk mengurangi pencampuran sampah dan mempercepat penanganan di area pasar.',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          date: '2025-02-08',
          category: 'Kebijakan',
          content: 'Pemisahan yang baik juga memberi peluang pengolahan lanjutan yang lebih efisien dan bernilai ekonomi.',
        },
        {
          id: 'N-006',
          title: 'Ruang publik yang bersih terbukti meningkatkan kenyamanan aktivitas warga',
          summary: 'Kebersihan area berpengaruh pada kesehatan, kenyamanan, dan persepsi kualitas lingkungan kota.',
          image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
          date: '2025-02-05',
          category: 'Lingkungan',
          content: 'Wilayah yang terjaga kebersihannya mendorong interaksi sosial yang lebih sehat dan aktivitas publik yang lebih aman.',
        },
      ],
      education: [
        {
          id: 'E-001',
          title: 'Pemilahan sampah rumah tangga yang benar',
          category: 'Pemilahan',
          summary: 'Pisahkan sampah organik, anorganik, dan residu untuk memudahkan proses pengelolaan lanjutan.',
          content: 'Sediakan sedikitnya dua atau tiga wadah berbeda di rumah. Beri label yang jelas dan terapkan pemisahan secara konsisten.',
          image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'E-002',
          title: 'Jenis-jenis sampah dan dampaknya terhadap lingkungan',
          category: 'Dasar',
          summary: 'Memahami jenis sampah membantu masyarakat mengambil keputusan yang lebih tepat saat membuang atau mengolahnya.',
          content: 'Sampah organik dapat terurai dan diolah menjadi kompos, sementara anorganik sering membutuhkan proses daur ulang khusus. Sampah berbahaya memerlukan penanganan terpisah.',
          image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'E-003',
          title: 'Langkah awal penanganan titik sampah kecil di lingkungan sekitar',
          category: 'Penanganan Awal',
          summary: 'Tindakan awal yang aman membantu mencegah penumpukan sebelum kondisi membesar.',
          content: 'Gunakan sarung tangan, pisahkan benda tajam, dan sampaikan laporan apabila area berada dekat aliran air atau fasilitas umum agar penanganannya terkoordinasi.',
          image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'E-004',
          title: 'Upaya menjaga kebersihan wilayah bersama komunitas',
          category: 'Komunitas',
          summary: 'Kegiatan kebersihan lebih efektif apabila dilakukan secara rutin oleh komunitas.',
          content: 'Susun jadwal kegiatan, dokumentasikan hasil, dan gunakan data pelaporan untuk menentukan prioritas area.',
          image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'E-005',
          title: 'Praktik daur ulang sederhana di rumah',
          category: 'Daur Ulang',
          summary: 'Pembersihan kemasan dan pengumpulan material sejenis membantu proses daur ulang.',
          content: 'Kemasan plastik, kardus, dan botol dapat lebih mudah diproses bila dalam kondisi bersih, kering, dan dipisahkan sesuai jenisnya.',
          image: 'https://images.unsplash.com/photo-1498408040764-ab6eb772a145?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'E-006',
          title: 'Pengurangan sampah sekali pakai saat beraktivitas di luar rumah',
          category: 'Perilaku',
          summary: 'Perubahan kebiasaan harian dapat mengurangi volume sampah wilayah.',
          content: 'Penggunaan botol minum, tas belanja guna ulang, dan wadah makanan sendiri membantu mengurangi sampah sekali pakai.',
          image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
        },
      ],
    };

    const els = {
      pages: document.querySelectorAll('[data-page]'),
      navLinks: document.querySelectorAll('.nav-link[data-route], .mobile-sheet .nav-link[data-route]'),
      routeTriggers: document.querySelectorAll('[data-go], [data-route]'),
      menuToggle: document.getElementById('menuToggle'),
      mobileMenu: document.getElementById('mobileMenu'),
      featureGrid: document.getElementById('featureGrid'),
      quickMetrics: document.getElementById('quickMetrics'),
      latestReports: document.getElementById('latestReports'),
      recapMetrics: document.getElementById('recapMetrics'),
      recapList: document.getElementById('recapList'),
      recapEmpty: document.getElementById('recapEmpty'),
      rewardSummary: document.getElementById('rewardSummary'),
      rewardTableBody: document.getElementById('rewardTableBody'),
      rewardEmpty: document.getElementById('rewardEmpty'),
      downloadRewardExcelBtn: document.getElementById('downloadRewardExcelBtn'),
      rankingList: document.getElementById('rankingList'),
      timeBars: document.getElementById('timeBars'),
      timeBarLabels: document.getElementById('timeBarLabels'),
      newsGrid: document.getElementById('newsGrid'),
      newsEmpty: document.getElementById('newsEmpty'),
      newsSearch: document.getElementById('newsSearch'),
      newsCategoryFilters: document.getElementById('newsCategoryFilters'),
      educationGrid: document.getElementById('educationGrid'),
      educationEmpty: document.getElementById('educationEmpty'),
      eduSearch: document.getElementById('eduSearch'),
      educationTabs: document.getElementById('educationTabs'),
      areaSearch: document.getElementById('areaSearch'),
      dateFilter: document.getElementById('dateFilter'),
      statusFilter: document.getElementById('statusFilter'),
      wasteFilter: document.getElementById('wasteFilter'),
      sortFilter: document.getElementById('sortFilter'),
      reportForm: document.getElementById('reportForm'),
      reportTime: document.getElementById('reportTime'),
      reportTimeBadge: document.getElementById('reportTimeBadge'),
      reportDescription: document.getElementById('reportDescription'),
      differentTimeCard: document.getElementById('differentTimeCard'),
      differentTimeToggle: document.getElementById('differentTimeToggle'),
      incidentTimeWrap: document.getElementById('incidentTimeWrap'),
      incidentTime: document.getElementById('incidentTime'),
      optionalDetails: document.getElementById('optionalDetails'),
      reportWasteType: document.getElementById('reportWasteType'),
      reportImpact: document.getElementById('reportImpact'),
      reportVolume: document.getElementById('reportVolume'),
      conditionPicker: document.getElementById('conditionPicker'),
      reportMap: document.getElementById('reportMap'),
      reportMapPin: document.getElementById('reportMapPin'),
      detectLocationBtn: document.getElementById('detectLocationBtn'),
      coordinateReadout: document.getElementById('coordinateReadout'),
      reportPhoto: document.getElementById('reportPhoto'),
      uploadArea: document.getElementById('uploadArea'),
      uploadPreview: document.getElementById('uploadPreview'),
      pickFileBtn: document.getElementById('pickFileBtn'),
      reporterName: document.getElementById('reporterName'),
      reporterContact: document.getElementById('reporterContact'),
      submissionFeedback: document.getElementById('submissionFeedback'),
      recapRealtimeMap: document.getElementById('recapRealtimeMap'),
      recapMapCaption: document.getElementById('recapMapCaption'),
      toastStack: document.getElementById('toastStack'),
      counters: document.querySelectorAll('[data-counter]'),
      errorFields: document.querySelectorAll('[data-error]'),
      heroDashboard: document.getElementById('heroDashboard'),
    };

    const featureCards = [
      {
        key: 'pelaporan',
        icon: svgIcon.report,
        title: 'Pelaporan',
        description: 'Lokasi, volume, dan dokumentasi dicatat melalui formulir pelaporan.',
      },
      {
        key: 'rekapitulasi',
        icon: svgIcon.recap,
        title: 'Rekapitulasi',
        description: 'Denah titik laporan dan ringkasan area disusun dari data laporan yang tersedia.',
      },
      {
        key: 'news',
        icon: svgIcon.news,
        title: 'Berita',
        description: 'Informasi dan perkembangan isu pengelolaan sampah tersedia pada halaman ini.',
      },
      {
        key: 'edukasi',
        icon: svgIcon.edu,
        title: 'Edukasi',
        description: 'Materi edukasi mendukung pemahaman mengenai pemilahan dan pengelolaan sampah.',
      },
    ];

    let reportMapInstance = null;
    let reportMapMarker = null;
    let reportTileLayer = null;
    let recapMapInstance = null;
    let recapTileLayer = null;
    let recapMapMarkers = [];
    const FACILITY_MAP_IMAGE = 'image.png';
    const FACILITY_MAP_ALT = 'Denah area gudang dan logistik';
    const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const MAP_TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';
    const mapUiState = {
      report: { statusEl: null, textEl: null, retryBtn: null, timer: null, loaded: false, errors: 0 },
      recap: { statusEl: null, textEl: null, retryBtn: null, timer: null, loaded: false, errors: 0 },
    };
    const cinematicMediaState = {
      rafId: 0,
      finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };

    function formatDate(dateString, withTime = false) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '-';

      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      }).format(date);
    }

    function titleCase(text = '') {
      return String(text)
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    function escapeHtml(value = '') {
      return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char]));
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getVolumeMeta(volume = 'sedikit') {
      const key = normalizeText(volume).toLowerCase();
      return reportConfig.volumeLevels[key]
        || Object.values(reportConfig.volumeLevels).find((item) => item.label.toLowerCase() === key)
        || reportConfig.volumeLevels.sedikit;
    }

    function getRiskMeta(risk = 'Tidak mengganggu') {
      const key = normalizeText(risk).toLowerCase();
      return reportConfig.riskLevels[risk]
        || Object.entries(reportConfig.riskLevels).find(([label]) => label.toLowerCase() === key)?.[1]
        || reportConfig.riskLevels['Tidak mengganggu'];
    }

    function getStatusMetaByScore(score) {
      if (score <= 1) return reportConfig.statusLevels.green;
      if (score <= 3) return reportConfig.statusLevels.yellow;
      return reportConfig.statusLevels.red;
    }

    function getReportStatusMeta(reportOrVolume = 'sedikit', risk = 'Tidak mengganggu') {
      const isReport = reportOrVolume && typeof reportOrVolume === 'object';
      const volume = isReport ? (reportOrVolume.volume || reportOrVolume.kondisiSampah) : reportOrVolume;
      const impact = isReport
        ? (reportOrVolume.dampak || reportOrVolume.risikoKhusus || reportOrVolume.risiko || reportOrVolume.impact)
        : risk;
      const score = getVolumeMeta(volume).score + getRiskMeta(impact).score;
      const statusMeta = getStatusMetaByScore(score);
      return { ...statusMeta, score };
    }

    function getReportStatusClass(report) {
      return report?.statusClass || getReportStatusMeta(report).className;
    }

    function buildReportRecord({
      id,
      reportedAt = '',
      waktuKejadian = '',
      namaArea = '',
      patokan = '',
      koordinat = null,
      mapPoint = null,
      volume = '',
      jenisSampah = '',
      dampak = '',
      deskripsi = '',
      dokumentasi = [],
      pelaporNama = '',
      pelaporKontak = '',
    }) {
      const createdAt = reportedAt || new Date().toISOString();
      const statusMeta = getReportStatusMeta({ volume, dampak });
      const photos = Array.isArray(dokumentasi) ? dokumentasi.slice() : [];
      const point = mapPoint || (koordinat?.mapX != null && koordinat?.mapY != null
        ? { x: koordinat.mapX, y: koordinat.mapY }
        : null);
      const locationName = normalizeText(namaArea || koordinat?.lokasi || patokan);
      const pointLabel = normalizeText(patokan);
      const reporterName = normalizeText(pelaporNama);
      const reporterContact = normalizeText(pelaporKontak);

      return {
        id,
        waktu: formatInputValue(new Date(createdAt)),
        waktuPelaporan: createdAt,
        waktuKejadian: waktuKejadian || '',
        namaPelapor: reporterName,
        pelaporNama: reporterName,
        nomorTeleponEmail: reporterContact,
        pelaporKontak: reporterContact,
        lokasiArea: locationName,
        namaArea: locationName,
        lokasi: locationName,
        titikLaporan: pointLabel,
        patokan: pointLabel,
        patokanLokasi: pointLabel,
        koordinat,
        mapPoint: point,
        volume,
        kondisiSampah: volume,
        jenisSampah,
        dampak,
        risikoKhusus: dampak,
        deskripsi,
        dokumentasi: photos,
        fotoDokumentasi: photos,
        statusLaporan: statusMeta.label,
        statusClass: statusMeta.className,
        statusScore: statusMeta.score,
        createdAt,
        incidentAt: waktuKejadian || '',
      };
    }

    function getStatusGradient(statusClass) {
      if (statusClass === 'yellow') return 'linear-gradient(90deg,#fde047,#f59e0b)';
      if (statusClass === 'red') return 'linear-gradient(90deg,#fb7185,#ef4444)';
      return 'linear-gradient(90deg,#22c55e,#16a34a)';
    }

    const crc32Table = (() => {
      const table = new Uint32Array(256);
      for (let i = 0; i < 256; i += 1) {
        let c = i;
        for (let k = 0; k < 8; k += 1) {
          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)) >>> 0;
        }
        table[i] = c >>> 0;
      }
      return table;
    })();

    function xmlEscape(value = '') {
      return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      }[char]));
    }

    function textToBytes(text) {
      return new TextEncoder().encode(String(text));
    }

    function crc32(bytes) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i += 1) {
        crc = crc32Table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function buildZip(entries) {
      const localParts = [];
      const centralParts = [];
      let offset = 0;

      entries.forEach((entry) => {
        const nameBytes = textToBytes(entry.name);
        const dataBytes = entry.data instanceof Uint8Array ? entry.data : textToBytes(entry.data);
        const checksum = crc32(dataBytes);

        const localHeader = new Uint8Array(30 + nameBytes.length);
        const localView = new DataView(localHeader.buffer);
        localView.setUint32(0, 0x04034b50, true);
        localView.setUint16(4, 20, true);
        localView.setUint16(6, 0, true);
        localView.setUint16(8, 0, true);
        localView.setUint16(10, 0, true);
        localView.setUint16(12, 0, true);
        localView.setUint32(14, checksum, true);
        localView.setUint32(18, dataBytes.length, true);
        localView.setUint32(22, dataBytes.length, true);
        localView.setUint16(26, nameBytes.length, true);
        localView.setUint16(28, 0, true);
        localHeader.set(nameBytes, 30);
        localParts.push(localHeader, dataBytes);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        const centralView = new DataView(centralHeader.buffer);
        centralView.setUint32(0, 0x02014b50, true);
        centralView.setUint16(4, 20, true);
        centralView.setUint16(6, 20, true);
        centralView.setUint16(8, 0, true);
        centralView.setUint16(10, 0, true);
        centralView.setUint16(12, 0, true);
        centralView.setUint16(14, 0, true);
        centralView.setUint32(16, checksum, true);
        centralView.setUint32(20, dataBytes.length, true);
        centralView.setUint32(24, dataBytes.length, true);
        centralView.setUint16(28, nameBytes.length, true);
        centralView.setUint16(30, 0, true);
        centralView.setUint16(32, 0, true);
        centralView.setUint16(34, 0, true);
        centralView.setUint16(36, 0, true);
        centralView.setUint32(38, 0, true);
        centralView.setUint32(42, offset, true);
        centralHeader.set(nameBytes, 46);
        centralParts.push(centralHeader);

        offset += localHeader.length + dataBytes.length;
      });

      const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
      const endRecord = new Uint8Array(22);
      const endView = new DataView(endRecord.buffer);
      endView.setUint32(0, 0x06054b50, true);
      endView.setUint16(4, 0, true);
      endView.setUint16(6, 0, true);
      endView.setUint16(8, entries.length, true);
      endView.setUint16(10, entries.length, true);
      endView.setUint32(12, centralSize, true);
      endView.setUint32(16, offset, true);
      endView.setUint16(20, 0, true);

      return new Blob([...localParts, ...centralParts, endRecord], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    function buildRewardRowsXml(rows) {
      const columnRefs = ['A', 'B', 'C', 'D', 'E'];
      const widths = [8, 28, 32, 18, 14];
      const headerStyle = 1;
      const sharedStrings = [];
      const sharedStringMap = new Map();

      const getSharedStringIndex = (value) => {
        const text = String(value);
        if (sharedStringMap.has(text)) return sharedStringMap.get(text);
        const index = sharedStrings.length;
        sharedStrings.push(text);
        sharedStringMap.set(text, index);
        return index;
      };

      const rowXml = rows.map((row, index) => {
        const rowNumber = index + 1;
        const cells = row.map((value, colIndex) => {
          const ref = `${columnRefs[colIndex]}${rowNumber}`;
          if (typeof value === 'number') {
            return `<c r="${ref}"><v>${value}</v></c>`;
          }
          const stringIndex = getSharedStringIndex(value);
          return `<c r="${ref}" t="s"${index === 0 ? ` s="${headerStyle}"` : ''}><v>${stringIndex}</v></c>`;
        }).join('');
        return `<row r="${rowNumber}">${cells}</row>`;
      }).join('');

      const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${rows.reduce((sum, row) => sum + row.length, 0)}" uniqueCount="${sharedStrings.length}">
  ${sharedStrings.map((text) => `<si><t xml:space="preserve">${xmlEscape(text)}</t></si>`).join('')}
</sst>`;

      return {
        sheetXml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A2" sqref="A2"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <dimension ref="A1:E${rows.length}"/>
  <cols>
    ${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}
  </cols>
  <sheetData>${rowXml}</sheetData>
  <autoFilter ref="A1:E${rows.length}"/>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`,
        sharedStringsXml,
      };
    }

    function buildRewardWorkbookBlob(rewardRows) {
      const rows = [
        ['No', 'Nama Pelapor', 'Nomor Telepon / Email', 'Jumlah Pelaporan', 'Jumlah Poin'],
        ...rewardRows.map((row, index) => ([
          index + 1,
          row.namaPelapor,
          row.kontakPelapor,
          row.jumlahPelaporan,
          row.jumlahPoin,
        ])),
      ];

      const { sheetXml, sharedStringsXml } = buildRewardRowsXml(rows);
      const now = new Date().toISOString();
      const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${xmlEscape(rewardConfig.sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

      const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`;

      const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

      const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

      const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font>
      <sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/>
    </font>
    <font>
      <b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF16A34A"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
  </cellXfs>
</styleSheet>`;

      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Reward Pelapor</dc:title>
  <dc:creator>CollectWaste</dc:creator>
  <cp:lastModifiedBy>CollectWaste</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;

      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>CollectWaste</Application>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>${xmlEscape(rewardConfig.sheetName)}</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
</Properties>`;

      return buildZip([
        { name: '[Content_Types].xml', data: contentTypesXml },
        { name: '_rels/.rels', data: rootRelsXml },
        { name: 'docProps/core.xml', data: coreXml },
        { name: 'docProps/app.xml', data: appXml },
        { name: 'xl/workbook.xml', data: workbookXml },
        { name: 'xl/_rels/workbook.xml.rels', data: relsXml },
        { name: 'xl/styles.xml', data: stylesXml },
        { name: 'xl/sharedStrings.xml', data: sharedStringsXml },
        { name: 'xl/worksheets/sheet1.xml', data: sheetXml },
      ]);
    }

    function getDisplayLocation(report) {
      return getReportAreaName(report);
    }

    function getReportReporterName(report) {
      return normalizeText(report?.namaPelapor || report?.pelaporNama) || '-';
    }

    function getReportReporterContact(report) {
      return normalizeText(report?.nomorTeleponEmail || report?.pelaporKontak) || '-';
    }

    function getReportAreaName(report) {
      return normalizeText(report?.lokasiArea || report?.namaArea || report?.lokasi || report?.patokan) || 'Titik laporan';
    }

    function getReportPointName(report) {
      return normalizeText(report?.titikLaporan || report?.patokanLokasi || report?.patokan) || 'Titik laporan';
    }

    function getReportConditionName(report) {
      return normalizeText(report?.kondisiSampah || report?.volume) || '-';
    }

    function getReportRiskName(report) {
      return normalizeText(report?.risikoKhusus || report?.dampak) || '-';
    }

    function getReportPhotoList(report) {
      return Array.isArray(report?.fotoDokumentasi) ? report.fotoDokumentasi : Array.isArray(report?.dokumentasi) ? report.dokumentasi : [];
    }

    function getReportTimeValue(report) {
      return report?.waktuPelaporan || report?.createdAt || report?.waktu || '';
    }

    function getReportStatusLabel(report) {
      return report?.statusLaporan || getReportStatusMeta(report).label;
    }

    function normalizeText(value = '') {
      return String(value || '').trim();
    }

    function getNearestFacility(mapX, mapY) {
      if (mapX == null || mapY == null) return null;

      return facilityReferencePoints.reduce((best, facility) => {
        const nearestDistance = facility.points.reduce((min, point) => {
          const distance = Math.hypot(point.x - mapX, point.y - mapY);
          return Math.min(min, distance);
        }, Infinity);

        if (!best || nearestDistance < best.distance) {
          return { ...facility, distance: nearestDistance };
        }

        return best;
      }, null);
    }

    function getCoordinateLabel(coordinates) {
      if (coordinates?.x != null && coordinates?.y != null) {
        return `Titik laporan - titik ${coordinates.x.toFixed(1)}%, ${coordinates.y.toFixed(1)}%`;
      }
      if (coordinates?.mapX != null && coordinates?.mapY != null) {
        const facility = getNearestFacility(coordinates.mapX, coordinates.mapY);
        const prefix = facility ? `${facility.number}. ${facility.name}` : 'Area denah';
        return `${prefix} - titik ${coordinates.mapX.toFixed(1)}%, ${coordinates.mapY.toFixed(1)}%`;
      }
      if (coordinates?.lat == null || coordinates?.lng == null) return 'Belum dipilih';
      return `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
    }

    function getFacilityMapBaseMarkup() {
      return `<img class="facility-map-image" src="${FACILITY_MAP_IMAGE}" alt="${FACILITY_MAP_ALT}" draggable="false" />`;
    }

    function ensureFacilityMapBase(container) {
      if (!container) return;
      container.classList.add('facility-map');
      if (!container.querySelector('.facility-map-image')) {
        container.insertAdjacentHTML('afterbegin', getFacilityMapBaseMarkup());
      }
    }

    function getReportMapPoint(report) {
      if (report?.mapPoint?.x != null && report?.mapPoint?.y != null) {
        return report.mapPoint;
      }

      if (report?.koordinat?.mapX != null && report?.koordinat?.mapY != null) {
        return { x: report.koordinat.mapX, y: report.koordinat.mapY };
      }

      if (report?.koordinat?.lat != null && report?.koordinat?.lng != null) {
        return projectCoordinatesToMap(report.koordinat.lat, report.koordinat.lng);
      }

      return { x: 50, y: 50 };
    }

    function getMapMarkerStyle(reportOrVolume = 'sedikit', riskOrSelected = 'Tidak mengganggu', selected = false) {
      const isSelected = typeof riskOrSelected === 'boolean' ? riskOrSelected : selected;
      const risk = typeof riskOrSelected === 'boolean' ? 'Tidak mengganggu' : riskOrSelected;
      const className = getReportStatusMeta(reportOrVolume, risk).className;
      const colors = {
        green: { fill: '#22c55e', halo: 'rgba(34,197,94,0.18)' },
        yellow: { fill: '#facc15', halo: 'rgba(250,204,21,0.2)' },
        red: { fill: '#ef4444', halo: 'rgba(239,68,68,0.18)' },
      };
      const palette = colors[className] || colors.green;

      return {
        radius: isSelected ? 9 : 8,
        weight: 4,
        color: 'rgba(255,255,255,0.95)',
        fillColor: palette.fill,
        fillOpacity: 1,
        opacity: 1,
        className: 'live-map-marker',
        bubblingMouseEvents: false,
      };
    }

    function clearRecapMapMarkers() {
      recapMapMarkers.forEach((marker) => marker.remove());
      recapMapMarkers = [];
    }

    function getTileLayerByKey(key) {
      return key === 'report' ? reportTileLayer : recapTileLayer;
    }

    function setTileLayerByKey(key, layer) {
      if (key === 'report') {
        reportTileLayer = layer;
        return;
      }
      recapTileLayer = layer;
    }

    function getMapInstanceByKey(key) {
      return key === 'report' ? reportMapInstance : recapMapInstance;
    }

    function ensureMapStatus(key, container) {
      const state = mapUiState[key];
      if (!container || state.statusEl) return;

      const statusEl = document.createElement('div');
      statusEl.className = 'map-status';
      statusEl.innerHTML = `
        <div class="map-status-card">
          <div>
            <strong>Peta dasar belum tersedia</strong>
            <p class="map-status-text">Koneksi ke server peta belum berhasil. Muat ulang untuk menampilkan peta.</p>
          </div>
          <div class="map-status-actions">
            <button type="button" class="btn btn-secondary map-status-action">Muat Ulang</button>
          </div>
        </div>
      `;

      container.appendChild(statusEl);
      state.statusEl = statusEl;
      state.textEl = statusEl.querySelector('.map-status-text');
      state.retryBtn = statusEl.querySelector('button');
      state.retryBtn?.addEventListener('click', () => reloadMapTiles(key));
    }

    function clearMapWatch(key) {
      const state = mapUiState[key];
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
    }

    function showMapStatus(key, message) {
      const state = mapUiState[key];
      if (!state.statusEl) return;
      state.textEl.textContent = message;
      state.statusEl.classList.add('visible');
    }

    function hideMapStatus(key) {
      const state = mapUiState[key];
      state.statusEl?.classList.remove('visible');
    }

    function watchTileLayer(key, tileLayer) {
      const state = mapUiState[key];
      state.loaded = false;
      state.errors = 0;
      clearMapWatch(key);
      hideMapStatus(key);

      state.timer = window.setTimeout(() => {
        if (!state.loaded) {
          showMapStatus(key, 'Peta dasar belum berhasil dimuat. Periksa koneksi internet lalu pilih Muat Ulang.');
        }
      }, 5500);

      tileLayer.on('tileload', () => {
        state.loaded = true;
        clearMapWatch(key);
        hideMapStatus(key);
      });

      tileLayer.on('load', () => {
        state.loaded = true;
        clearMapWatch(key);
        hideMapStatus(key);
      });

      tileLayer.on('tileerror', () => {
        state.errors += 1;
        if (!state.loaded && state.errors >= 2) {
          clearMapWatch(key);
          showMapStatus(key, 'Bagian peta tidak dapat dimuat. Periksa koneksi internet atau pilih Muat Ulang.');
        }
      });
    }

    function mountTileLayer(key, mapInstance) {
      const tileLayer = L.tileLayer(MAP_TILE_URL, {
        maxZoom: 19,
        attribution: MAP_TILE_ATTRIBUTION,
      });

      watchTileLayer(key, tileLayer);
      tileLayer.addTo(mapInstance);
      setTileLayerByKey(key, tileLayer);
      return tileLayer;
    }

    function reloadMapTiles(key) {
      const mapInstance = getMapInstanceByKey(key);
      if (!mapInstance) return;

      const currentLayer = getTileLayerByKey(key);
      if (currentLayer) {
        currentLayer.off();
        mapInstance.removeLayer(currentLayer);
      }

      hideMapStatus(key);
      mountTileLayer(key, mapInstance);
    }

    function handleFileProtocolMaps() {
      if (window.location.protocol !== 'file:') return false;

      const message = 'Peta hanya dapat ditampilkan melalui http://127.0.0.1:4173/test.html, bukan melalui file://.';

      if (els.reportMap) {
        ensureMapStatus('report', els.reportMap);
        showMapStatus('report', message);
      }

      if (els.recapRealtimeMap) {
        ensureMapStatus('recap', els.recapRealtimeMap);
        showMapStatus('recap', message);
      }

      return true;
    }

    function refreshMapLayouts() {
      if (reportMapInstance) reportMapInstance.invalidateSize();
      if (recapMapInstance) recapMapInstance.invalidateSize();
    }

    function resetCinematicMedia(el) {
      if (!el) return;
      el.classList.remove('is-active');
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
      el.style.setProperty('--roll-z', '0deg');
      el.style.setProperty('--shift-x', '0px');
      el.style.setProperty('--shift-y', '0px');
      el.style.setProperty('--overlay-x', '0px');
      el.style.setProperty('--overlay-y', '0px');
      el.style.setProperty('--glare-x', '0px');
      el.style.setProperty('--glare-y', '0px');
      el.style.setProperty('--spot-x', '50%');
      el.style.setProperty('--spot-y', '50%');
    }

    function updateCinematicMediaDepth() {
      if (cinematicMediaState.reducedMotion) return;
      if (cinematicMediaState.rafId) return;

      cinematicMediaState.rafId = window.requestAnimationFrame(() => {
        cinematicMediaState.rafId = 0;
        const viewportCenter = window.innerHeight / 2;

        document.querySelectorAll('.cinematic-media').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;

          const center = rect.top + rect.height / 2;
          const ratio = clamp((center - viewportCenter) / Math.max(viewportCenter, 1), -1, 1);
          el.style.setProperty('--scroll-card-y', `${ratio * -18}px`);
          el.style.setProperty('--scroll-image-y', `${ratio * 24}px`);
        });
      });
    }

    function bindCinematicMedia(el) {
      if (!el || el.dataset.cinematicBound === '1') return;
      el.dataset.cinematicBound = '1';
      resetCinematicMedia(el);

      if (cinematicMediaState.reducedMotion) return;
      if (!cinematicMediaState.finePointer) return;

      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        const dx = px - 0.5;
        const dy = py - 0.5;

        el.classList.add('is-active');
        el.style.setProperty('--tilt-x', `${dy * -14}deg`);
        el.style.setProperty('--tilt-y', `${dx * 16}deg`);
        el.style.setProperty('--roll-z', `${dx * 2.8}deg`);
        el.style.setProperty('--shift-x', `${dx * -34}px`);
        el.style.setProperty('--shift-y', `${dy * -24}px`);
        el.style.setProperty('--overlay-x', `${dx * 34}px`);
        el.style.setProperty('--overlay-y', `${dy * 26}px`);
        el.style.setProperty('--glare-x', `${dx * -18}px`);
        el.style.setProperty('--glare-y', `${dy * -16}px`);
        el.style.setProperty('--spot-x', `${px * 100}%`);
        el.style.setProperty('--spot-y', `${py * 100}%`);
      });

      el.addEventListener('pointerleave', () => {
        resetCinematicMedia(el);
      });
    }

    function setupCinematicMedia(root = document) {
      if (cinematicMediaState.reducedMotion) {
        root.querySelectorAll('.cinematic-media').forEach(resetCinematicMedia);
        return;
      }
      root.querySelectorAll('.cinematic-media').forEach(bindCinematicMedia);
      updateCinematicMediaDepth();
    }

    function createReportMap() {
      ensureFacilityMapBase(els.reportMap);
    }

    function createRecapMap() {
      ensureFacilityMapBase(els.recapRealtimeMap);
    }

    function initMaps(page = appState.activePage) {
      if (page === 'pelaporan') {
        createReportMap();
        updateMapPins();
      }

      if (page === 'rekapitulasi') {
        createRecapMap();
        renderRealtimeMap(getFilteredReports());
      }

      window.setTimeout(refreshMapLayouts, 0);
    }

    function projectCoordinatesToMap(lat, lng) {
      const { lat: centerLat, lng: centerLng } = reportConfig.mapCenter;
      const { lat: latRange, lng: lngRange } = reportConfig.mapRange;
      const x = ((lng - (centerLng - lngRange / 2)) / lngRange) * 100;
      const y = (((centerLat + latRange / 2) - lat) / latRange) * 100;

      return {
        x: clamp(x, 8, 92),
        y: clamp(y, 10, 90),
      };
    }

    function mapPointToCoordinates(mapX, mapY) {
      const { lat: centerLat, lng: centerLng } = reportConfig.mapCenter;
      const { lat: latRange, lng: lngRange } = reportConfig.mapRange;

      return {
        lat: centerLat + latRange / 2 - (mapY / 100) * latRange,
        lng: centerLng - lngRange / 2 + (mapX / 100) * lngRange,
      };
    }

    function getDominantValue(values, comparator) {
      const counts = values.reduce((acc, value) => {
        if (!value) return acc;
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts)
        .sort((a, b) => {
          const diff = b[1] - a[1];
          if (diff) return diff;
          return comparator ? comparator(a[0], b[0]) : a[0].localeCompare(b[0], 'id-ID');
        })[0]?.[0] || '';
    }

    function calculateRecap(reports) {
      const now = new Date();
      const groups = reports.reduce((acc, report) => {
        const key = getDisplayLocation(report).trim().toLowerCase();
        if (!acc[key]) {
          acc[key] = {
            id: `A-${String(Object.keys(acc).length + 1).padStart(3, '0')}`,
            key,
            reports: [],
          };
        }
        acc[key].reports.push(report);
        return acc;
      }, {});

      return Object.values(groups).map((group) => {
        const sortedReports = group.reports.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestReport = sortedReports[0];
        const reports7d = group.reports.filter((report) => ((now - new Date(report.createdAt)) / 86400000) <= 7).length;
        const statusCounts = group.reports.reduce((acc, report) => {
          const statusClass = getReportStatusClass(report);
          acc[statusClass] = (acc[statusClass] || 0) + 1;
          return acc;
        }, { green: 0, yellow: 0, red: 0 });

        const dominantWaste = getDominantValue(group.reports.map((report) => report.jenisSampah));
        const dominantImpact = getDominantValue(group.reports.map((report) => report.dampak));
        const latestVolumeMeta = getVolumeMeta(latestReport.volume);
        const latestStatusMeta = getReportStatusMeta(latestReport);

        return {
          id: group.id,
          key: group.key,
          namaArea: getReportAreaName(latestReport),
          lokasiArea: getReportAreaName(latestReport),
          namaPelapor: getReportReporterName(latestReport),
          nomorTeleponEmail: getReportReporterContact(latestReport),
          waktuPelaporan: getReportTimeValue(latestReport),
          patokanUtama: getReportPointName(latestReport),
          titikLaporanUtama: getReportPointName(latestReport),
          jumlahLaporan: group.reports.length,
          statusArea: latestStatusMeta.label,
          statusLaporan: latestStatusMeta.label,
          statusClass: latestStatusMeta.className,
          statusScore: latestStatusMeta.score,
          latestVolumeKey: latestReport.volume,
          latestVolumeLabel: latestVolumeMeta.label,
          kondisiSampahTerkini: latestVolumeMeta.label,
          kondisiSampahTerkiniKey: latestReport.volume,
          dominantWaste: dominantWaste || '-',
          jenisSampahDominan: dominantWaste || '-',
          dominantImpact: dominantImpact || '-',
          risikoKhususDominan: dominantImpact || '-',
          latestReportAt: latestReport.createdAt,
          latestCoordinates: {
            ...latestReport.koordinat,
            mapX: getReportMapPoint(latestReport).x,
            mapY: getReportMapPoint(latestReport).y,
          },
          latestMapPoint: latestReport.mapPoint,
          frequencyWindow: `${reports7d} laporan / 7 hari`,
          percentage: latestStatusMeta.progress,
          totalPhotos: group.reports.reduce((sum, report) => sum + getReportPhotoList(report).length, 0),
          statusCounts,
        };
      });
    }

    function getRewardKey(report) {
      const name = normalizeText(report.namaPelapor || report.pelaporNama);
      const contact = normalizeText(report.nomorTeleponEmail || report.pelaporKontak);
      if (!name && !contact) return '';
      return (contact || name).toLowerCase();
    }

    function getRewardDisplayName(report) {
      return getReportReporterName(report);
    }

    function getRewardDisplayContact(report) {
      return getReportReporterContact(report);
    }

    function getRewardPoints(reportCount) {
      return Number(reportCount || 0) * rewardConfig.pointsPerReport;
    }

    function calculateRewardReports(reports = appState.reports) {
      const grouped = reports.reduce((acc, report) => {
        const key = getRewardKey(report);
        if (!key) return acc;

        if (!acc[key]) {
          acc[key] = {
            key,
            namaPelapor: getRewardDisplayName(report),
            kontakPelapor: getRewardDisplayContact(report),
            jumlahPelaporan: 0,
          };
        }

        const entry = acc[key];
        if (normalizeText(report.pelaporNama) && entry.namaPelapor === '-') {
          entry.namaPelapor = normalizeText(report.pelaporNama);
        }
        if (normalizeText(report.pelaporKontak) && entry.kontakPelapor === '-') {
          entry.kontakPelapor = normalizeText(report.pelaporKontak);
        }
        entry.jumlahPelaporan += 1;
        return acc;
      }, {});

      return Object.values(grouped)
        .map((entry) => ({
          ...entry,
          jumlahPoin: getRewardPoints(entry.jumlahPelaporan),
        }))
        .sort((a, b) => b.jumlahPelaporan - a.jumlahPelaporan || a.namaPelapor.localeCompare(b.namaPelapor, 'id-ID'));
    }

    function renderReward() {
      if (!els.rewardTableBody || !els.rewardSummary || !els.rewardEmpty) return;

      const rewardRows = calculateRewardReports(appState.reports);
      const totalReports = rewardRows.reduce((sum, row) => sum + row.jumlahPelaporan, 0);
      const totalPoints = rewardRows.reduce((sum, row) => sum + row.jumlahPoin, 0);
      const topReward = rewardRows[0] || null;

      els.rewardSummary.innerHTML = [
        createMetricCard(svgIcon.total, 'Pelapor Aktif', rewardRows.length.toLocaleString('id-ID'), 'Jumlah pelapor unik yang sudah mengirim laporan valid.', '', 0),
        createMetricCard(svgIcon.green, 'Total Laporan Valid', totalReports.toLocaleString('id-ID'), 'Seluruh laporan valid yang dihitung untuk reward.', 'green', 1),
        createMetricCard(svgIcon.yellow, 'Total Poin', totalPoints.toLocaleString('id-ID'), 'Akumulasi poin reward dari laporan valid.', 'yellow', 2),
        createMetricCard(svgIcon.area, 'Pelapor Teratas', topReward ? escapeHtml(topReward.namaPelapor) : '-', topReward ? `${topReward.jumlahPelaporan} laporan valid` : 'Belum ada data reward.', '', 3),
      ].join('');

      els.rewardTableBody.innerHTML = rewardRows.map((row, index) => `
        <tr>
          <td><span class="reward-rank">${index + 1}</span></td>
          <td>${escapeHtml(row.namaPelapor)}</td>
          <td>${escapeHtml(row.kontakPelapor)}</td>
          <td>${row.jumlahPelaporan}</td>
          <td>${row.jumlahPoin}</td>
        </tr>
      `).join('');

      els.rewardEmpty.style.display = rewardRows.length ? 'none' : 'block';
      els.downloadRewardExcelBtn.disabled = !rewardRows.length && !appState.reports.length;
    }

    function downloadRewardExcel() {
      const rewardRows = calculateRewardReports(appState.reports);
      const xlsxBlob = buildRewardWorkbookBlob(rewardRows);
      const url = URL.createObjectURL(xlsxBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = rewardConfig.fileName;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function createMetricCard(icon, title, value, desc, metaClass = '', order = 0) {
      return `
        <article class="metric-card" style="--item-order:${order % 6};">
          <div class="metric-icon">${icon}</div>
          <h3>${title}</h3>
          <strong>${value}</strong>
          <p>${desc}</p>
          <span class="metric-meta ${metaClass}">${metaClass === 'green' ? 'Terkendali' : metaClass === 'yellow' ? 'Perlu perhatian' : metaClass === 'red' ? 'Prioritas tinggi' : 'Terkini'}</span>
        </article>
      `;
    }

    function renderFeatureCards() {
      els.featureGrid.innerHTML = featureCards.map((item, index) => `
        <button class="feature-card" data-go="${item.key}" style="--item-order:${index % 6};">
          <div class="feature-icon">${item.icon}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <span class="link-row">Buka Halaman <span>&#8594;</span></span>
        </button>
      `).join('');
    }

    function getDashboardSummary() {
      const recaps = calculateRecap(appState.reports);
      const latest = appState.reports.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

      return {
        totalReports: appState.reports.length,
        totalAreas: recaps.length,
        greenAreas: recaps.filter((item) => item.statusClass === 'green').length,
        yellowAreas: recaps.filter((item) => item.statusClass === 'yellow').length,
        redAreas: recaps.filter((item) => item.statusClass === 'red').length,
        latest,
        highestArea: recaps.slice().sort((a, b) => b.jumlahLaporan - a.jumlahLaporan)[0],
      };
    }

    function animateCounter(el, target) {
      const end = Number(target) || 0;
      const start = 0;
      const duration = 1000;
      const startTime = performance.now();

      function update(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const value = Math.floor(start + (end - start) * (1 - Math.pow(1 - progress, 3)));
        el.textContent = value.toLocaleString('id-ID');
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }

    function renderQuickMetrics() {
      const summary = getDashboardSummary();
      const latestText = summary.latest ? formatDate(summary.latest.createdAt, true) : '-';
      const latestLocation = summary.latest ? getDisplayLocation(summary.latest) : '-';

      els.quickMetrics.innerHTML = [
        createMetricCard(svgIcon.total, 'Total Laporan', summary.totalReports.toLocaleString('id-ID'), 'Jumlah laporan yang menjadi dasar pemantauan area dan denah titik laporan.', '', 0),
        createMetricCard(svgIcon.green, 'Area Aman', summary.greenAreas, 'Area dengan status aman atau terkendali.', 'green', 1),
        createMetricCard(svgIcon.yellow, 'Area Perhatian', summary.yellowAreas, 'Area yang perlu perhatian berdasarkan kondisi dan risiko.', 'yellow', 2),
        createMetricCard(svgIcon.red, 'Area Prioritas', summary.redAreas, 'Area prioritas tinggi berdasarkan kondisi dan risiko.', 'red', 3),
        createMetricCard(svgIcon.area, 'Laporan Terbaru', latestText, `Lokasi terbaru: ${escapeHtml(latestLocation)}`, '', 4),
      ].join('');
    }

    function renderReportDetailGrid(report, variant = 'default') {
      const photoCount = getReportPhotoList(report).length;
      const timeValue = getReportTimeValue(report);
      const conditionValue = normalizeText(report.volume || report.kondisiSampah);
      const conditionLabel = conditionValue ? getVolumeMeta(conditionValue).label : '-';
      const detailItems = [
        ['Nama pelapor', getReportReporterName(report)],
        ['Nomor telepon / email', getReportReporterContact(report)],
        ['Lokasi area', getReportAreaName(report)],
        ['Titik denah / titik laporan', getCoordinateLabel(report.koordinat || getReportMapPoint(report))],
        ['Patokan lokasi', getReportPointName(report)],
        ['Kondisi sampah', conditionLabel],
        ['Risiko khusus', getReportRiskName(report)],
        ['Jenis sampah', normalizeText(report.jenisSampah) || '-'],
        ['Dampak', normalizeText(report.dampak || report.risikoKhusus) || '-'],
        ['Foto dokumentasi', `${photoCount} foto`],
        ['Waktu pelaporan', timeValue ? formatDate(timeValue, true) : '-'],
        ['Status laporan', getReportStatusLabel(report)],
      ];

      return `
        <div class="report-details-grid ${variant === 'recap' ? 'recap-details-grid' : ''}">
          ${detailItems.map(([label, value]) => `
            <div class="report-detail-field">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
            </div>
          `).join('')}
        </div>
      `;
    }

    function renderLatestReports() {
      if (!els.latestReports) return;

      const latestReports = appState.reports
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

      els.latestReports.innerHTML = latestReports.map((report, index) => {
        const statusMeta = getReportStatusMeta(report);
        const conditionValue = normalizeText(report.volume || report.kondisiSampah);
        const conditionLabel = conditionValue ? getVolumeMeta(conditionValue).label : '-';
        return `
        <article class="report-item" style="--item-order:${index % 6};">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:start; flex-wrap:wrap;">
            <div>
              <h4 style="font-size:1.2rem;">${escapeHtml(getDisplayLocation(report))}</h4>
              <p>${escapeHtml(report.deskripsi || 'Tidak ada deskripsi tambahan.')}</p>
            </div>
            <span class="status-badge ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
          </div>
          <div class="meta">
            <span class="tag">${getReportTimeValue(report) ? formatDate(getReportTimeValue(report), true) : '-'}</span>
            <span class="tag">${escapeHtml(getReportAreaName(report))}</span>
            <span class="tag">${escapeHtml(getReportPointName(report))}</span>
            <span class="tag">${escapeHtml(conditionLabel)}</span>
            <span class="tag">${escapeHtml(getReportRiskName(report))}</span>
            <span class="tag">${getReportPhotoList(report).length} foto</span>
          </div>
          ${renderReportDetailGrid(report)}
        </article>
      `;
      }).join('');
    }

    function renderHomeCounters() {
      if (!els.counters.length) return;

      const summary = getDashboardSummary();
      const countersMap = {
        reports: summary.totalReports,
        areas: summary.totalAreas,
        greenAreas: summary.greenAreas,
        criticalAreas: summary.redAreas,
      };

      els.counters.forEach((counterEl) => {
        counterEl.textContent = countersMap[counterEl.dataset.counter] || 0;
      });

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            els.counters.forEach((counterEl) => animateCounter(counterEl, countersMap[counterEl.dataset.counter] || 0));
            obs.disconnect();
          }
        });
      }, { threshold: 0.45 });

      const firstCounter = els.counters[0];
      if (firstCounter) observer.observe(firstCounter);
    }

    function getFilteredReports() {
      const now = new Date();
      const query = appState.recapSearch.trim().toLowerCase();

      return appState.reports.filter((report) => {
        const matchesSearch = !query || [
          getDisplayLocation(report),
          getReportPointName(report),
          getReportReporterName(report),
          getReportReporterContact(report),
          getReportRiskName(report),
          normalizeText(report.jenisSampah),
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

        const matchesDate = appState.recapDateFilter === 'all'
          || ((now - new Date(report.createdAt)) / 86400000) <= Number(appState.recapDateFilter);

        const matchesStatus = appState.recapStatusFilter === 'all' || getReportStatusClass(report) === appState.recapStatusFilter;
        const matchesWaste = appState.recapWasteFilter === 'all' || report.jenisSampah === appState.recapWasteFilter;

        return matchesSearch && matchesDate && matchesStatus && matchesWaste;
      });
    }

    function getRecapMetricsData(filteredReports, recaps) {
      const latest = filteredReports.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
      const topArea = recaps.slice().sort((a, b) => b.jumlahLaporan - a.jumlahLaporan)[0] || null;

      return [
        createMetricCard(svgIcon.total, 'Total laporan aktif', filteredReports.length, 'Jumlah laporan yang sesuai dengan filter yang digunakan.', '', 0),
        createMetricCard(svgIcon.green, 'Aman/Terkendali', filteredReports.filter((item) => getReportStatusClass(item) === 'green').length, 'Laporan dengan status aman atau terkendali.', 'green', 1),
        createMetricCard(svgIcon.yellow, 'Perlu Perhatian', filteredReports.filter((item) => getReportStatusClass(item) === 'yellow').length, 'Laporan yang perlu perhatian.', 'yellow', 2),
        createMetricCard(svgIcon.red, 'Prioritas Tinggi', filteredReports.filter((item) => getReportStatusClass(item) === 'red').length, 'Laporan dengan prioritas tinggi.', 'red', 3),
        createMetricCard(svgIcon.area, 'Area dengan laporan terbanyak', topArea?.namaArea || '-', latest ? `Data terbaru ${formatDate(latest.createdAt, true)}.` : 'Belum ada data terbaru.', '', 4),
      ].join('');
    }

    function getFilteredRecaps(filteredReports = getFilteredReports()) {
      const recaps = calculateRecap(filteredReports);

      recaps.sort((a, b) => {
        switch (appState.recapSort) {
          case 'reports-desc':
            return b.jumlahLaporan - a.jumlahLaporan;
          case 'priority-desc':
            return b.statusScore - a.statusScore
              || b.jumlahLaporan - a.jumlahLaporan;
          case 'name-asc':
            return a.namaArea.localeCompare(b.namaArea, 'id-ID');
          case 'latest-desc':
          default:
            return new Date(b.latestReportAt) - new Date(a.latestReportAt);
        }
      });

      return recaps;
    }

    function renderRecap() {
      const filteredReports = getFilteredReports();
      const recaps = getFilteredRecaps(filteredReports);
      els.recapMetrics.innerHTML = getRecapMetricsData(filteredReports, recaps);

      els.recapList.innerHTML = recaps.map((item, index) => `
        <article class="recap-row" style="--item-order:${index % 6};">
          <div class="recap-main">
            <div class="recap-head">
              <div>
                <h4 style="font-size:1.2rem;">${escapeHtml(item.namaArea)}</h4>
                <p>${item.jumlahLaporan} laporan &bull; ${item.frequencyWindow} &bull; Pembaruan terakhir ${formatDate(item.latestReportAt, true)}</p>
              </div>
            </div>
            <div class="recap-status-row">
              <span class="status-badge ${item.statusClass}">${escapeHtml(item.statusArea)}</span>
            </div>
            <div class="recap-meta-strip">
              <span class="tag">${escapeHtml(item.patokanUtama || 'Patokan belum tersedia')}</span>
              <span class="tag">${escapeHtml(getCoordinateLabel(item.latestCoordinates))}</span>
              <span class="tag">${escapeHtml(item.latestVolumeLabel)}</span>
              <span class="tag">${escapeHtml(item.jenisSampahDominan)}</span>
              <span class="tag">${escapeHtml(item.risikoKhususDominan)}</span>
              <span class="tag">${item.totalPhotos} foto</span>
            </div>
            <div class="recap-detail-block">
              <div class="recap-detail-head">Detail laporan</div>
              ${renderReportDetailGrid({
              namaPelapor: item.namaPelapor,
              pelaporNama: item.namaPelapor,
              nomorTeleponEmail: item.nomorTeleponEmail,
              pelaporKontak: item.nomorTeleponEmail,
              lokasiArea: item.lokasiArea,
              namaArea: item.lokasiArea,
              titikLaporan: item.titikLaporanUtama,
              patokanLokasi: item.patokanUtama,
              patokan: item.patokanUtama,
              koordinat: item.latestCoordinates,
              volume: item.kondisiSampahTerkiniKey || item.latestVolumeKey,
              jenisSampah: item.jenisSampahDominan,
              dampak: item.risikoKhususDominan,
              dokumentasi: Array.from({ length: item.totalPhotos }),
              waktuPelaporan: item.waktuPelaporan,
              createdAt: item.latestReportAt,
              statusLaporan: item.statusLaporan,
              statusClass: item.statusClass,
            }, 'recap')}
            </div>
          </div>
          <aside class="recap-aside">
            <div class="recap-score">
              <div class="score-top">
                <span>Status terkini</span>
                <strong style="color:var(--text)">${escapeHtml(item.statusLaporan)}</strong>
              </div>
              <div class="progress recap-progress">
                <span style="width:${item.percentage}%; background:${getStatusGradient(item.statusClass)}"></span>
              </div>
              <div class="recap-status-chips">
                <span class="tag">Aman ${item.statusCounts.green || 0}</span>
                <span class="tag">Perhatian ${item.statusCounts.yellow || 0}</span>
                <span class="tag">Prioritas ${item.statusCounts.red || 0}</span>
              </div>
            </div>
            <div class="recap-total-card">
              <span>Ringkasan jumlah laporan</span>
              <strong>${item.jumlahLaporan}</strong>
              <p>Rekap ini berisi jumlah laporan yang sudah masuk pada area tersebut.</p>
            </div>
          </aside>
        </article>
      `).join('');

      els.recapEmpty.style.display = recaps.length ? 'none' : 'block';
      renderRanking(recaps);
      renderRealtimeMap(filteredReports);
      renderTimeBars(filteredReports);
    }

    function renderRanking(recaps) {
      const ranking = (recaps.length ? recaps : calculateRecap(appState.reports))
        .slice()
        .sort((a, b) => b.jumlahLaporan - a.jumlahLaporan)
        .slice(0, 5);

      els.rankingList.innerHTML = ranking.map((item, index) => `
        <article class="ranking-item" style="--item-order:${index % 6};">
          <div class="rank-badge">#${index + 1}</div>
          <div>
            <h4 style="font-size:1.08rem;">${escapeHtml(item.namaArea)}</h4>
            <p>${item.jumlahLaporan} laporan &bull; ${item.frequencyWindow}</p>
            <div class="meta">
              <span class="status-badge ${item.statusClass}">${escapeHtml(item.statusArea)}</span>
              <span class="tag">${escapeHtml(item.jenisSampahDominan)}</span>
            </div>
          </div>
          <span class="soft-badge">${item.jumlahLaporan} laporan</span>
        </article>
      `).join('');
    }

    function renderRealtimeMap(reports) {
      if (!els.recapRealtimeMap) return;
      ensureFacilityMapBase(els.recapRealtimeMap);

      const latestReports = reports
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      if (recapMapInstance) {
        if (!latestReports.length) {
          clearRecapMapMarkers();
          recapMapInstance.setView([reportConfig.mapCenter.lat, reportConfig.mapCenter.lng], 13);
          els.recapMapCaption.textContent = 'Tidak ada data laporan untuk ditampilkan pada denah.';
          return;
        }

        clearRecapMapMarkers();

        const bounds = [];
        recapMapMarkers = latestReports.map((report) => {
          const latLng = [report.koordinat.lat, report.koordinat.lng];
          const statusMeta = getReportStatusMeta(report);
          const marker = L.circleMarker(latLng, getMapMarkerStyle(report)).addTo(recapMapInstance);
          marker.bindTooltip(`${getDisplayLocation(report)} - ${statusMeta.label}`, {
            permanent: true,
            direction: 'top',
            offset: [0, -10],
            className: 'map-tooltip',
          });
          bounds.push(latLng);
          return marker;
        });

        if (bounds.length === 1) {
          recapMapInstance.setView(bounds[0], 16);
        } else {
          recapMapInstance.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
        }

        refreshMapLayouts();
        els.recapMapCaption.textContent = `${reports.length} laporan sesuai dengan filter. ${latestReports.length} titik laporan terbaru ditampilkan pada denah.`;
        return;
      }

      if (!latestReports.length) {
        els.recapRealtimeMap.innerHTML = `${getFacilityMapBaseMarkup()}<div class="upload-empty map-empty-state">Tidak terdapat titik laporan yang sesuai dengan filter saat ini.</div>`;
        els.recapMapCaption.textContent = 'Tidak ada data laporan untuk ditampilkan pada denah.';
        return;
      }

      els.recapRealtimeMap.innerHTML = getFacilityMapBaseMarkup() + latestReports.map((report) => {
        const point = getReportMapPoint(report);
        const statusMeta = getReportStatusMeta(report);
        const label = `${getDisplayLocation(report)} - ${statusMeta.label}`;
        return `
        <span class="pin ${statusMeta.className}" data-label="" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}" style="top:${point.y}%; left:${point.x}%"></span>
      `;
      }).join('');

      els.recapMapCaption.textContent = `${reports.length} laporan sesuai dengan filter. ${latestReports.length} titik laporan terbaru ditampilkan pada denah.`;
    }

    function renderTimeBars(reports = appState.reports) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        return date;
      });

      const values = days.map((day) => reports.filter((report) => {
        const createdAt = new Date(report.createdAt);
        return createdAt.getFullYear() === day.getFullYear()
          && createdAt.getMonth() === day.getMonth()
          && createdAt.getDate() === day.getDate();
      }).length);

      const max = Math.max(...values, 1);
      els.timeBars.innerHTML = values.map((value) => `
        <div class="bar-wrap">
          <span style="font-size:0.8rem; font-weight:700; color:var(--muted);">${value}</span>
          <div class="bar ${value / max >= 0.75 ? 'red' : value / max >= 0.45 ? 'yellow' : ''}" style="height:${max ? (value / max) * 90 : 0}%"></div>
        </div>
      `).join('');

      els.timeBarLabels.innerHTML = days.map((day) => `
        <span>${day.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
      `).join('');
    }

    function renderNewsFilters() {
      const categories = ['Semua', ...new Set(appState.news.map(item => item.category))];
      els.newsCategoryFilters.innerHTML = categories.map(category => `
        <button class="filter-chip ${appState.newsCategory === category ? 'active' : ''}" data-news-category="${category}">${category}</button>
      `).join('');
    }

    function renderNews() {
      renderNewsFilters();
      const q = appState.newsSearch.toLowerCase();
      const filtered = appState.news.filter((item) => {
        const searchMatch = item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
        const categoryMatch = appState.newsCategory === 'Semua' || item.category === appState.newsCategory;
        return searchMatch && categoryMatch;
      });

      els.newsGrid.innerHTML = filtered.map((item, index) => `
        <article class="news-card" style="--item-order:${index % 6};">
          <div class="thumb cinematic-media"><img class="cinematic-image" src="${item.image}" alt="${item.title}" loading="lazy" /></div>
          <span class="soft-badge">${item.category}</span>
          <h3 style="font-size:1.28rem; margin:14px 0 10px;">${item.title}</h3>
          <p>${item.summary}</p>
          <div class="meta">
            <span class="tag">${formatDate(item.date)}</span>
            <span class="tag">Berita lingkungan</span>
          </div>
          <span class="link-row">Baca selengkapnya <span>&#8594;</span></span>
        </article>
      `).join('');

      els.newsEmpty.style.display = filtered.length ? 'none' : 'block';
      setupCinematicMedia(els.newsGrid);
    }

    function renderEducationTabs() {
      const categories = ['Semua', ...new Set(appState.education.map(item => item.category))];
      els.educationTabs.innerHTML = categories.map(category => `
        <button class="tab ${appState.educationCategory === category ? 'active' : ''}" data-edu-category="${category}">${category}</button>
      `).join('');
    }

    function renderEducation() {
      renderEducationTabs();
      const q = appState.educationSearch.toLowerCase();
      const filtered = appState.education.filter((item) => {
        const searchMatch = item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
        const categoryMatch = appState.educationCategory === 'Semua' || item.category === appState.educationCategory;
        return searchMatch && categoryMatch;
      });

      els.educationGrid.innerHTML = filtered.map((item, index) => `
        <article class="edu-card" style="--item-order:${index % 6};">
          <div class="thumb cinematic-media"><img class="cinematic-image" src="${item.image}" alt="${item.title}" loading="lazy" /></div>
          <span class="soft-badge">${item.category}</span>
          <h3 style="font-size:1.24rem; margin:14px 0 10px;">${item.title}</h3>
          <p>${item.summary}</p>
          <div class="meta">
            <span class="tag">Materi edukasi</span>
            <span class="tag">Materi referensi</span>
          </div>
          <span class="link-row">Lihat materi <span>&#8594;</span></span>
        </article>
      `).join('');

      els.educationEmpty.style.display = filtered.length ? 'none' : 'block';
      setupCinematicMedia(els.educationGrid);
    }

    function updateActiveNav() {
      document.querySelectorAll('[data-route]').forEach((link) => {
        const target = link.dataset.route;
        link.classList.toggle('active', target === appState.activePage);
      });
    }

    function goToPage(page) {
      appState.activePage = page;
      document.body.dataset.activePage = page;
      els.pages.forEach((section) => section.classList.toggle('active', section.dataset.page === page));
      updateActiveNav();
      document.body.classList.remove('menu-open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', `#${page}`);
      window.setTimeout(() => initMaps(page), 180);
      window.setTimeout(updateCinematicMediaDepth, 200);
    }

    function showToast(type, title, message) {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <div style="font-size:1.2rem;">${type === 'success' ? 'OK' : '!'}</div>
        <div>
          <strong>${escapeHtml(title)}</strong>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
      els.toastStack.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 240);
      }, 3200);
    }

    function syncReportTimestamp() {
      const now = new Date();
      const isoString = now.toISOString();
      els.reportTime.value = isoString;
      els.reportTimeBadge.textContent = formatDate(isoString, true);
    }

    function renderPhotoPreview() {
      if (!appState.reportPhotos.length) {
        els.uploadPreview.innerHTML = '<div class="upload-empty">Belum ada foto yang diunggah. Sekurang-kurangnya satu foto diperlukan untuk validasi laporan.</div>';
        return;
      }

      els.uploadPreview.innerHTML = appState.reportPhotos.map((photo, index) => `
        <article class="photo-card cinematic-media" style="--item-order:${index % 6};">
          <img class="cinematic-image" src="${photo.src}" alt="${escapeHtml(photo.name)}" />
          <div class="photo-meta">
            <span>${escapeHtml(photo.name)}</span>
            <button type="button" class="btn btn-ghost" data-remove-photo="${photo.id}" style="padding:10px 14px; width:auto;">Hapus</button>
          </div>
        </article>
      `).join('');
      setupCinematicMedia(els.uploadPreview);
    }

    function updateMapPins() {
      const data = getFormData();

      if (reportMapInstance) {
        if (!data.koordinat) {
          if (reportMapMarker) {
            reportMapMarker.remove();
            reportMapMarker = null;
          }
          if (els.reportMapPin) els.reportMapPin.hidden = true;
          return;
        }

        const latLng = [data.koordinat.lat, data.koordinat.lng];
        const previousLatLng = reportMapMarker?.getLatLng?.() || null;
        if (!reportMapMarker) {
          reportMapMarker = L.circleMarker(latLng, getMapMarkerStyle(data, true)).addTo(reportMapInstance);
        } else {
          reportMapMarker.setLatLng(latLng);
          reportMapMarker.setStyle(getMapMarkerStyle(data, true));
        }

        if (els.reportMapPin) els.reportMapPin.hidden = true;
        if (!previousLatLng || previousLatLng.lat !== data.koordinat.lat || previousLatLng.lng !== data.koordinat.lng) {
          reportMapInstance.setView(latLng, Math.max(reportMapInstance.getZoom(), 16), { animate: true });
        }
        return;
      }

      const pinTargets = [els.reportMapPin];

      pinTargets.forEach((pinEl) => {
        if (!pinEl) return;

        if (!data.koordinat) {
          pinEl.hidden = true;
          return;
        }

        pinEl.hidden = false;
        pinEl.className = `pin ${getReportStatusClass(data)}`;
        pinEl.style.left = `${data.koordinat.mapX}%`;
        pinEl.style.top = `${data.koordinat.mapY}%`;
      });

      if (els.reportMapPin && data.koordinat) {
        const facilityName = getNearestFacility(data.koordinat.mapX, data.koordinat.mapY)?.name || 'Titik laporan';
        els.reportMapPin.dataset.label = `${facilityName} - ${getReportStatusMeta(data).label}`;
      }
    }

    function updateReportSummary() {
      const data = getFormData();
      if (els.coordinateReadout) {
        els.coordinateReadout.textContent = data.koordinat ? getCoordinateLabel(data.koordinat) : 'Belum ada titik denah.';
      }
      updateMapPins();
    }

    function renderSubmissionFeedback() {
      if (!els.submissionFeedback) return;

      if (!appState.lastSubmittedReport) {
        els.submissionFeedback.innerHTML = '';
        return;
      }

      const report = appState.lastSubmittedReport;
      const statusMeta = getReportStatusMeta(report);

      els.submissionFeedback.innerHTML = `
        <article class="success-panel">
          <div class="success-icon">OK</div>
          <div>
            <span class="soft-badge">Laporan ${escapeHtml(report.id)} tersimpan</span>
            <h4>Laporan berhasil disimpan</h4>
            <p>${escapeHtml(getDisplayLocation(report))} tercatat pada denah titik laporan dengan status ${escapeHtml(statusMeta.label)}. Rekapitulasi area telah diperbarui.</p>
            <div class="meta">
              <span class="tag">Nama pelapor: ${escapeHtml(getReportReporterName(report))}</span>
              <span class="tag">Lokasi area: ${escapeHtml(getReportAreaName(report))}</span>
              <span class="tag">Status laporan: ${escapeHtml(statusMeta.label)}</span>
            </div>
            <div class="success-actions">
              <button type="button" class="btn btn-primary" data-go="rekapitulasi">Lihat Denah dan Rekapitulasi</button>
              <button type="button" class="btn btn-secondary" data-action="new-report">Formulir Baru</button>
            </div>
          </div>
        </article>
      `;
    }

    function setCondition(condition) {
      appState.selectedCondition = condition;
      els.reportVolume.value = condition;
      document.querySelectorAll('.segment[data-condition]').forEach((btn) => btn.classList.toggle('active', btn.dataset.condition === condition));
      validateField('volume');
      updateReportSummary();
    }

    function setCoordinates({ lat, lng, mapX, mapY }) {
      const projected = mapX == null || mapY == null
        ? projectCoordinatesToMap(lat, lng)
        : { x: mapX, y: mapY };

      appState.selectedCoordinates = {
        lat,
        lng,
        mapX: projected.x,
        mapY: projected.y,
      };
      validateField('koordinat');
      updateReportSummary();
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    async function addPhotos(fileList) {
      const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
      if (!files.length) return;

      const photos = await Promise.all(files.map(async (file, index) => ({
        id: `P-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        src: await readFileAsDataUrl(file),
      })));

      appState.reportPhotos = [...appState.reportPhotos, ...photos];
      els.reportPhoto.value = '';
      renderPhotoPreview();
      validateField('dokumentasi');
      updateReportSummary();
    }

    function removePhoto(photoId) {
      appState.reportPhotos = appState.reportPhotos.filter((photo) => photo.id !== photoId);
      renderPhotoPreview();
      validateField('dokumentasi');
      updateReportSummary();
    }

    function getFormData() {
      const selectedFacility = getNearestFacility(
        appState.selectedCoordinates?.mapX,
        appState.selectedCoordinates?.mapY
      );
      const selectedPointLabel = appState.selectedCoordinates
        ? getCoordinateLabel(appState.selectedCoordinates)
        : '';

      return {
        waktu: els.reportTime.value,
        waktuKejadian: els.differentTimeToggle.checked ? els.incidentTime.value : '',
        koordinat: appState.selectedCoordinates,
        patokan: selectedPointLabel,
        lokasi: selectedFacility?.name || '',
        deskripsi: els.reportDescription.value.trim(),
        jenisSampah: els.reportWasteType.value,
        dampak: els.reportImpact.value,
        volume: els.reportVolume.value,
        dokumentasi: appState.reportPhotos.slice(),
        pelaporNama: els.reporterName.value.trim(),
        pelaporKontak: els.reporterContact.value.trim(),
      };
    }

    function setError(field, message = '') {
      const errorEl = document.querySelector(`[data-error="${field}"]`);
      if (errorEl) errorEl.textContent = message;
    }

    function validateField(field) {
      const data = getFormData();
      switch (field) {
        case 'koordinat':
          if (!data.koordinat) return setError(field, 'Tentukan titik lokasi pada denah.');
          return setError(field, '');
        case 'waktuKejadian':
          if (!els.differentTimeToggle.checked) return setError(field, '');
          if (!data.waktuKejadian) return setError(field, 'Isi waktu kejadian atau nonaktifkan opsi ini.');
          if (new Date(data.waktuKejadian) > new Date(data.waktu)) return setError(field, 'Waktu kejadian tidak boleh melebihi waktu pelaporan.');
          return setError(field, '');
        case 'volume':
          if (!data.volume) return setError(field, 'Pilih kondisi sampah di lokasi.');
          return setError(field, '');
        case 'jenisSampah':
          if (!data.jenisSampah) return setError(field, 'Pilih jenis sampah yang paling dominan.');
          return setError(field, '');
        case 'dampak':
          if (!data.dampak) return setError(field, 'Pilih dampak atau risiko yang paling sesuai.');
          return setError(field, '');
        case 'dokumentasi':
          if (!data.dokumentasi.length) return setError(field, 'Unggah sekurang-kurangnya satu foto sebagai dokumentasi.');
          return setError(field, '');
        case 'pelaporNama':
          if (!data.pelaporNama) return setError(field, 'Isi nama pelapor.');
          return setError(field, '');
        case 'pelaporKontak':
          if (!data.pelaporKontak) return setError(field, 'Isi nomor telepon atau alamat email pelapor.');
          if (data.pelaporKontak.length < 8 && !data.pelaporKontak.includes('@')) {
            return setError(field, 'Nomor telepon atau alamat email belum lengkap.');
          }
          return setError(field, '');
        default:
          return setError(field, '');
      }
    }

    function validateForm() {
      ['koordinat', 'waktuKejadian', 'volume', 'jenisSampah', 'dampak', 'dokumentasi', 'pelaporNama', 'pelaporKontak'].forEach(validateField);
      return !Array.from(els.errorFields).some((el) => el.textContent.trim());
    }

    function resetForm() {
      els.reportForm.reset();
      syncReportTimestamp();
      appState.selectedCondition = '';
      appState.selectedCoordinates = null;
      appState.reportPhotos = [];
      els.reportVolume.value = '';
      els.differentTimeCard.classList.remove('active');
      els.incidentTimeWrap.classList.add('is-hidden');
      els.optionalDetails?.removeAttribute('open');
      document.querySelectorAll('.segment[data-condition]').forEach((btn) => btn.classList.remove('active'));
      els.errorFields.forEach((el) => { el.textContent = ''; });
      renderPhotoPreview();
      updateReportSummary();
    }

    function startNewReport() {
      appState.lastSubmittedReport = null;
      renderSubmissionFeedback();
      resetForm();
      els.reportForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function handleSubmit(event) {
      event.preventDefault();
      syncReportTimestamp();
      if (!validateForm()) {
        showToast('error', 'Data belum lengkap', 'Lengkapi titik denah, kondisi sampah, jenis sampah, risiko khusus, nama pelapor, nomor telepon atau email, dan sekurang-kurangnya satu foto.');
        return;
      }

      const data = getFormData();
      const newReport = buildReportRecord({
        id: `R-${String(appState.reports.length + 1).padStart(3, '0')}`,
        reportedAt: new Date(data.waktu).toISOString(),
        waktuKejadian: data.waktuKejadian ? new Date(data.waktuKejadian).toISOString() : '',
        namaArea: data.lokasi,
        patokan: data.patokan,
        koordinat: {
          lat: data.koordinat.lat,
          lng: data.koordinat.lng,
          mapX: data.koordinat.mapX,
          mapY: data.koordinat.mapY,
        },
        mapPoint: { x: data.koordinat.mapX, y: data.koordinat.mapY },
        volume: data.volume,
        jenisSampah: data.jenisSampah,
        dampak: data.dampak,
        deskripsi: data.deskripsi || `Laporan pada ${data.patokan}.`,
        dokumentasi: data.dokumentasi.map((photo) => photo.src),
        pelaporNama: data.pelaporNama,
        pelaporKontak: data.pelaporKontak,
      });

      appState.reports.unshift(newReport);
      appState.lastSubmittedReport = newReport;
      renderAllData();
      resetForm();
      renderSubmissionFeedback();
      showToast('success', 'Laporan berhasil disimpan', 'Data laporan telah masuk ke denah titik laporan dan rekapitulasi area.');
      els.submissionFeedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function requestCurrentLocation() {
      const mapX = 50;
      const mapY = 50;
      const coordinates = mapPointToCoordinates(mapX, mapY);
      setCoordinates({ lat: coordinates.lat, lng: coordinates.lng, mapX, mapY });
      showToast('success', 'Titik denah dipilih', 'Titik tengah denah telah dimasukkan ke formulir.');
    }

    function applyRevealOrder() {
      document.querySelectorAll('.reveal').forEach((el, index) => {
        el.style.setProperty('--reveal-order', String(index % 8));
      });
    }

    function syncScrollState() {
      document.body.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    function handleReveal() {
      const revealEls = document.querySelectorAll('.reveal');
      applyRevealOrder();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.14 });
      revealEls.forEach((el) => observer.observe(el));
    }

    function attachEvents() {
      document.addEventListener('click', (e) => {
        const go = e.target.closest('[data-go]');
        if (go) {
          goToPage(go.dataset.go);
        }

        const route = e.target.closest('[data-route]');
        if (route) {
          e.preventDefault();
          goToPage(route.dataset.route);
        }

        const action = e.target.closest('[data-action]');
        if (action?.dataset.action === 'new-report') {
          startNewReport();
        }

        const removePhotoBtn = e.target.closest('[data-remove-photo]');
        if (removePhotoBtn) {
          removePhoto(removePhotoBtn.dataset.removePhoto);
        }

        const newsCategoryBtn = e.target.closest('[data-news-category]');
        if (newsCategoryBtn) {
          appState.newsCategory = newsCategoryBtn.dataset.newsCategory;
          renderNews();
        }

        const eduCategoryBtn = e.target.closest('[data-edu-category]');
        if (eduCategoryBtn) {
          appState.educationCategory = eduCategoryBtn.dataset.eduCategory;
          renderEducation();
        }

        if (e.target.closest('#downloadRewardExcelBtn')) {
          downloadRewardExcel();
        }

      });

      els.menuToggle?.addEventListener('click', () => document.body.classList.toggle('menu-open'));
      els.mobileMenu?.addEventListener('click', (e) => {
        if (e.target === els.mobileMenu) document.body.classList.remove('menu-open');
      });

      document.querySelectorAll('.segment[data-condition]').forEach((btn) => {
        btn.addEventListener('click', () => setCondition(btn.dataset.condition));
      });

      [
        els.reportDescription,
        els.reportWasteType,
        els.reportImpact,
        els.reporterName,
        els.reporterContact,
        els.incidentTime,
      ].forEach((input) => {
        input?.addEventListener('input', updateReportSummary);
        input?.addEventListener('change', updateReportSummary);
        input?.addEventListener('blur', () => validateField(input.name));
        input?.addEventListener('change', () => validateField(input.name));
      });

      els.differentTimeToggle?.addEventListener('change', () => {
        const isActive = els.differentTimeToggle.checked;
        els.differentTimeCard.classList.toggle('active', isActive);
        els.incidentTimeWrap.classList.toggle('is-hidden', !isActive);
        if (!isActive) {
          els.incidentTime.value = '';
          setError('waktuKejadian', '');
        }
        updateReportSummary();
      });

      if (!reportMapInstance) {
        els.reportMap?.addEventListener('click', (event) => {
          const rect = els.reportMap.getBoundingClientRect();
          const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 8, 92);
          const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 10, 90);
          const coordinates = mapPointToCoordinates(x, y);
          setCoordinates({ lat: coordinates.lat, lng: coordinates.lng, mapX: x, mapY: y });
        });
      }

      els.detectLocationBtn?.addEventListener('click', requestCurrentLocation);
      els.pickFileBtn?.addEventListener('click', () => els.reportPhoto.click());
      els.reportPhoto?.addEventListener('change', (e) => {
        addPhotos(e.target.files);
      });

      ['dragenter', 'dragover'].forEach((eventName) => {
        els.uploadArea?.addEventListener(eventName, (e) => {
          e.preventDefault();
          els.uploadArea.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach((eventName) => {
        els.uploadArea?.addEventListener(eventName, (e) => {
          e.preventDefault();
          els.uploadArea.classList.remove('dragover');
        });
      });
      els.uploadArea?.addEventListener('drop', (e) => {
        addPhotos(e.dataTransfer?.files);
      });

      els.reportForm?.addEventListener('submit', handleSubmit);
      window.addEventListener('resize', refreshMapLayouts, { passive: true });
      window.addEventListener('orientationchange', refreshMapLayouts);
      window.addEventListener('resize', updateCinematicMediaDepth, { passive: true });
      window.addEventListener('orientationchange', updateCinematicMediaDepth);

      els.areaSearch?.addEventListener('input', (e) => {
        appState.recapSearch = e.target.value;
        renderRecap();
      });
      els.dateFilter?.addEventListener('change', (e) => {
        appState.recapDateFilter = e.target.value;
        renderRecap();
      });
      els.statusFilter?.addEventListener('change', (e) => {
        appState.recapStatusFilter = e.target.value;
        renderRecap();
      });
      els.wasteFilter?.addEventListener('change', (e) => {
        appState.recapWasteFilter = e.target.value;
        renderRecap();
      });
      els.sortFilter?.addEventListener('change', (e) => {
        appState.recapSort = e.target.value;
        renderRecap();
      });
      els.newsSearch?.addEventListener('input', (e) => {
        appState.newsSearch = e.target.value;
        renderNews();
      });
      els.eduSearch?.addEventListener('input', (e) => {
        appState.educationSearch = e.target.value;
        renderEducation();
      });

      if (els.heroDashboard) {
        els.heroDashboard.addEventListener('mousemove', (e) => {
          if (window.innerWidth < 861) return;
          const rect = els.heroDashboard.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          els.heroDashboard.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
        });
        els.heroDashboard.addEventListener('mouseleave', () => {
          els.heroDashboard.style.transform = 'rotateY(-10deg) rotateX(7deg)';
        });
      }
    }

    function renderAllData() {
      renderSubmissionFeedback();
      renderRecap();
      renderReward();
      renderNews();
      renderEducation();
      renderHomeCounters();
    }

    function init() {
      const initialHash = window.location.hash.replace('#', '');
      if (initialHash && ['home', 'pelaporan', 'rekapitulasi', 'news', 'edukasi'].includes(initialHash)) {
        appState.activePage = initialHash;
      }
      goToPage(appState.activePage);
      initMaps();
      renderAllData();
      attachEvents();
      syncScrollState();
      window.addEventListener('scroll', syncScrollState, { passive: true });
      window.addEventListener('scroll', updateCinematicMediaDepth, { passive: true });
      setupCinematicMedia();
      handleReveal();
      resetForm();
      renderSubmissionFeedback();
      window.setInterval(syncReportTimestamp, 60000);
    }

    init();
